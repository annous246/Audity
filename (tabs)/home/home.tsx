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
import {getMeaningApi1} from '../../services/LibServices/MainLibService';
import {getMeaningApi2} from '../../services/LibServices/SecondLibService';
import {meaningType} from '../../types/types';
import {
  handleKeywordDetection,
  handleSpeechInterrupt,
  handleSpeechStop,
} from '../../utils/speechHandlers';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const Home = () => {
  const [listening, setListening] = useState<boolean>(false);
  const [activeDetecting, setActiveDetecting] = useState<boolean>(false);
  const [word, setWord] = useState<string>('');
  const [synonyms, setSynonyms] = useState<string[]>(['']);
  const [definition, setDefinition] = useState<string>('');
  const instantStop = useRef<boolean>(false);
  const alreadyCalled = useRef<boolean>(false);
  const talkingAnimation = useSharedValue(0);
  const wordAnimated = useSharedValue(0);
  const startKeyWord = 'ALEXA';

  const voiceAnimationRef = useRef<LottieView>(null);

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
      const f = async () => {
        await stopSpeechService();
      };
      f();
    }
  }, [listening]);
  async function init() {
    if (!listening) await startPorcupine(startKeyWord);
  }
  useEffect(() => {
    init();

    DeviceEventEmitter.addListener('SpeechServiceStopped', async () => {
      await handleSpeechStop(
        setSynonyms,
        setDefinition,
        setWord,
        instantStop,
        startKeyWord,
        alreadyCalled,
      );
    });

    DeviceEventEmitter.addListener('KeywordDetected', async () => {
      await handleKeywordDetection(
        setWord,
        setDefinition,
        setSynonyms,
        instantStop,
        setListening,
        alreadyCalled,
      );
    });

    DeviceEventEmitter.addListener('stopDetected', async () => {
      await handleSpeechInterrupt(setListening, instantStop, alreadyCalled);
    });
  }, []);

  useEffect(() => {
    //active listening detection -> animation

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        justifyContent: 'flex-start',
        alignItems: 'center',
        alignContent: 'center',
      }}>
      {/* <Button title="stopPorc" onPress={stopPorcupine} />
      <Button title="startporc" onPress={startPorcupine} />
      <Button title="start" onPress={startSpeechService} />
      <Button title="stop" onPress={stopSpeechService} /> */}
      <Text style={{color: 'black', fontSize: 20}}>
        {listening ? 'Listeining ...' : `Say the word (${startKeyWord})`}
      </Text>
      <Button title="startporc" onPress={() => startPorcupine(startKeyWord)} />
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
