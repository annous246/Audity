import {
  Button,
  NativeModules,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import TranscriptionComponent from './transcriptionComponent.tsx/TranscriptionComponent';
import {
  stopPorcupine,
  startPorcupine,
  porcStatus,
} from '../../services/SpeechServices/PorcupineService';
import ForegroundService from '@supersami/rn-foreground-service';
import axios from 'axios';
const {SpeechTranscribe} = NativeModules;
import {DeviceEventEmitter} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  startSpeechService,
  stopSpeechService,
} from '../../services/SpeechServices/SpeechService';
import LottieView from 'lottie-react-native';
import animations from '../../constants/animations';
import {
  speakText,
  speakAsyncTTS,
} from '../../services/SoundAndTTSServices/TtsNativeService';
import BackgroundService from 'react-native-background-actions';
import {getMeaningApi1} from '../../services/LibServices/MainLibService';
import {getMeaningApi2} from '../../services/LibServices/SecondLibService';
import {meaningType} from '../../types/types';
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Home = () => {
  const [listening, setListening] = useState<boolean>(false);
  const [activeDetecting, setActiveDetecting] = useState<boolean>(false);
  const [word, setWord] = useState<string>('');
  const [synonyms, setSynonyms] = useState<string[]>(['']);
  const [definition, setDefinition] = useState<string>('');
  const instantStop = useRef<boolean>(false);
  const talkingAnimation = useSharedValue(0);
  const wordAnimated = useSharedValue(0);

  const voiceAnimationRef = useRef<LottieView>(null);
  const backgroundPorcupineStart = async () => {
    await sleep(2000);
    await startPorcupine();
  };
  const startPorcupineBackground = async () => {
    await BackgroundService.start(backgroundPorcupineStart, {
      taskName: 'MyBackgroundTask',
      taskTitle: 'Background Running',
      taskDesc: 'Your function is running even in background.',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      parameters: {},
    });
  };
  const startAnimation = () => {
    // optional, start from beginning
    voiceAnimationRef.current?.play();
  };

  const stopAnimation = () => {
    voiceAnimationRef.current?.reset();
  };
  useEffect(() => {
    wordAnimated.value = withTiming(word.length ? 1 : 0, {duration: 300});
  }, [word]);
  useEffect(() => {
    talkingAnimation.value = withTiming(listening ? 1 : 0, {duration: 200});
    if (!listening) {
      //stop it all completely
      console.log('from distant service');
      const f = async () => await stopSpeechService();
      f();
      console.log('called !!!');
    }
  }, [listening]);
  function explain(data: any) {
    console.log(data);
    console.log(data['meta']['syns'][0]);
    return [data['shortdef'][0], data['meta']['syns'][0]];
  }

  useEffect(() => {
    const id = 0;
    // setInterval(() => {
    //   console.log('instantStop.current');
    //   console.log(instantStop.current);
    //   console.log(porcStatus());
    // }, 500);
    return () => {
      clearInterval(id);
    };
  }, []);

  async function realTimeExplain(result: any) {
    const [currentDefinition, syns] = explain(result);
    console.log('definition');
    console.log(currentDefinition);
    console.log('syn');
    console.log(syns);
    if (Array.isArray(syns)) setSynonyms(syns);
    setDefinition(currentDefinition);
    //open mic again for hearing stop

    await speakAsync('means ' + currentDefinition);
    console.log('*************', instantStop.current);
    if (instantStop.current) {
      instantStop.current = false;
      return;
    }
    await speakAsync('synonyms ');
    if (instantStop.current) {
      instantStop.current = false;
      return;
    }
    if (!syns.length) return;
    for (const syn of syns) {
      console.log(syn);
      await speakAsync(syn);
      console.log(instantStop.current);
      if (instantStop.current) {
        instantStop.current = false;
        return;
      }
    }
  }
  useEffect(() => {
    DeviceEventEmitter.addListener('SpeechServiceStopped', async () => {
      //safety against double call
      console.log('Speech service actually stopped');

      //do speaking before timeout otherwise itll be stopped
      let extracted_from_prev: string = '';
      let p = '';
      setWord((prev: string) => {
        extracted_from_prev = prev;
        return prev;
      });

      //await startPorcupine();
      const result: meaningType = await getMeaningApi1(extracted_from_prev);
      const result2: meaningType = await getMeaningApi2(extracted_from_prev);
      console.log(result2);
      //if not on the app  -> we call it on background after same delay
      if (instantStop.current) {
        instantStop.current = false;
        return;
      }
      if (!instantStop.current) await startPorcupineBackground();

      if (!result.ok) {
        //means didnt get the word
        console.log('didnt get');
        //try second service
        if (!result2.ok) {
          //fallback speak result 1
          return speak(
            `sorry didnt understand the word ${extracted_from_prev} Did you mean ${result.result} ?`,
          );
        } else {
          //got fallback
          await realTimeExplain(result2.result);
          DeviceEventEmitter.emit('NewWord', extracted_from_prev);
        }
      } else {
        //got first one
        console.log('got  it');
        await realTimeExplain(result.result);
        DeviceEventEmitter.emit('NewWord', extracted_from_prev);
      }
      //this is CRUTIAL + TIMEOUT AS SPEECH SERVICE TAKES TIME TO ACTUALLY CLEAR AUDIO STREAM !!!!!!
      if (instantStop.current) {
        instantStop.current = false;
        return;
      }
    });
    //starting detection
    DeviceEventEmitter.addListener('KeywordDetected', async index => {
      //keyword detected

      speak('Hello , whats the ambiguous word ');

      setWord('');
      setDefinition('');
      setSynonyms([]);
      instantStop.current = false;
      // await sleep(1000); DaNGEROUS IF STARTED REST WILL ONLY WORK IN BG
      setListening(true);
      await stopPorcupine();
      await startSpeechService();
    });
    DeviceEventEmitter.addListener('stopDetected', async index => {
      //keyword detected

      instantStop.current = true;
      speak('im listening');

      // await sleep(1000); DANGEROUS IF STARTED REST WILL ONLY WORK IN BG
      setListening(true);
      await stopPorcupine();
      await startSpeechService();
    });
  }, []);

  useEffect(() => {
    //active listening detection

    console.log('her');
    if (activeDetecting) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [activeDetecting]);
  const animation = useAnimatedStyle(() => {
    return {opacity: talkingAnimation.value};
  });
  const wordAnimation = useAnimatedStyle(() => {
    return {opacity: word.length ? 1 : 0};
  });

  //SOLUTION
  function speak(text: string) {
    ForegroundService.start({
      id: 204,
      title: 'Speaking...',
      message: 'TTS is running in background',
    });

    // Trigger the TTS
    speakText(text);
  }
  async function speakAsync(text: string) {
    ForegroundService.start({
      id: 205,
      title: 'Speaking...',
      message: 'TTS is running in background',
    });

    // Trigger the TTS
    await speakAsyncTTS(text);
  }
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        justifyContent: 'flex-start',
        alignItems: 'center',
        alignContent: 'center',
      }}>
      <Button
        title="speak"
        onPress={() => speak('Hello , whats the ambiguous word ?')}
      />
      <Button title="stopPorc" onPress={stopPorcupine} />
      <Button title="startporc" onPress={startPorcupine} />
      <Button title="start" onPress={startSpeechService} />
      <Button title="stop" onPress={stopSpeechService} />
      <Text style={{color: 'black', fontSize: 20}}>
        {listening ? 'Listeining ...' : 'Zzzzzzz'}
      </Text>

      <TranscriptionComponent
        listening={listening}
        setListening={setListening}
        setActiveDetecting={setActiveDetecting}
        setWord={setWord}
      />
      <Animated.View
        style={[
          {
            height: 150,
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          },
          animation,
        ]}>
        <LottieView
          loop={true}
          style={{width: 120, height: '50%'}}
          source={animations.voice}
          ref={voiceAnimationRef}
        />
      </Animated.View>
      <Animated.View style={[styles.wordContainer, wordAnimation]}>
        {word && (
          <Text style={{color: 'black', fontSize: 20}}>Word : {word}</Text>
        )}
        <Text style={{...styles.defaultText, fontSize: 12}}>
          <Text style={{fontSize: 13, fontWeight: 'bold'}}>
            General Definition :
          </Text>
          {definition}
        </Text>
        <Text>{'\n'}</Text>
        <Text style={{...styles.defaultText, fontSize: 12}}>
          <Text style={{fontSize: 13, fontWeight: 'bold'}}>
            Synonym{synonyms.length > 1 && 's'} :
          </Text>
          {'{'}
          {synonyms.map(
            (syn, index) => syn + (index != synonyms.length - 1 ? ', ' : ''),
          )}
          {'}'}
        </Text>
      </Animated.View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  defaultText: {
    color: 'black',
    fontSize: 20,
  },
  wordContainer: {
    maxWidth: '90%',
    padding: 10,
    paddingLeft: 13,
    paddingRight: 13,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: 'white',
    elevation: 5,
    marginBottom: 25,
  },
  container: {
    flex: 1,
    maxHeight: screenHeight - 75,
    padding: 10,
  },
});
