import React, {useEffect, useState} from 'react';
import {View, Text, Button, Platform} from 'react-native';
import {NativeModules, PermissionsAndroid} from 'react-native';
import {useSpeechTranscribe} from '../../../hooks/useSpeechTranscribe';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const {SpeechTranscribe} = NativeModules;

export default function TranscriptionComponent({
  setListening,
  listening,
  setActiveDetecting,
  setWord,
}: {
  setListening: any;
  listening: boolean;
  setActiveDetecting: any;
  setWord: any;
}) {
  const {partial, setFinalText, finalText} = useSpeechTranscribe();
  const heightAnimation = useSharedValue(0);
  const opacityAnimation = useSharedValue(0);

  const StopWord = 'coconut';
  const StartWord = 'explain';
  const start = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      await SpeechTranscribe.start();
    }
  };

  const stop = async () => {
    if (Platform.OS === 'android') {
      await SpeechTranscribe.stop();
    }
  };
  function detectKeyword(text: string, type: number) {
    const lastWord = text.slice(text.lastIndexOf(' ') + 1, text.length);
    const words = text.split(' ');
    let result: boolean = false;
    for (const word of words) {
      const condition =
        word.toLowerCase() ==
        (type == 1 ? StopWord.toLowerCase() : StartWord.toLowerCase());
      if (condition) console.log('detected ! ', word);
      result = result || condition;
    }
    return result ? (type ? 'end' : 'start') : 'null';
  }

  useEffect(() => {
    //real time transcribtion
    console.log(finalText);
    if (finalText.length) {
      //final text detected
      console.log('started');
      // setStarted((prev: boolean) => {
      //   console.log(prev);
      //   console.log(finalText);
      //   if (detectKeyword(finalText, 1) == 'end') {
      //     if (prev) {
      //       //key word detected  to stop
      //       console.log('stop************************************');
      //       console.log('stop');
      //       console.log('stop');
      //       stop();
      //       console.log('stop');
      //       setListening(false);
      //       start();
      //       setFinalText('');
      //       return false;
      //     } else {
      //       //erase just text not to mix ending word twise
      //       setFinalText('');
      //     }
      //   }

      //   // else if (detectKeyword(finalText, 0) == 'start' && !prev) {
      //   //   //key word detected  to start
      //   //   console.log('start********************************');
      //   //   console.log('start');
      //   //   console.log('start');
      //   //   setFinalText('');

      //   //   setListening(true);
      //   //   start();
      //   //   console.log('start');
      //   //   return true;
      //   // }
      //   return prev;
      // });
      /*closing word detection*/
      if (detectKeyword(finalText, 1) == 'end') {
        //key word detected  to stop
        console.log('stop************************************');
        console.log('stop');
        console.log('stop');
        //   stop(); DECOMMENTED FOR TESTING SERVICE DOUBLE DESTROY EMISSION
        console.log('stop');
        setListening(false);
        //before emptying set last word to be explained
        if (finalText.length) {
          //garanteed to have at least one word
          const trimmedPart = finalText
            .slice(0, finalText.lastIndexOf(' '))
            .trim();
          if (trimmedPart.length) {
            console.log('trim');
            console.log(trimmedPart);
            const beforeLastWord = trimmedPart.slice(
              trimmedPart.lastIndexOf(' ') + 1,
              trimmedPart.length,
            );
            console.log(beforeLastWord);
            console.log('final word is ' + beforeLastWord);
            setWord(beforeLastWord);
          }
        }
        setFinalText('');
      }
    }
  }, [finalText]);
  useEffect(() => {}, []);

  useEffect(() => {
    //treating outside real time voice animation
    if (partial.length) {
      setActiveDetecting(true);
    } else {
      setActiveDetecting(false);
    }
  }, [partial]);

  useEffect(() => {
    heightAnimation.value = withTiming(listening ? 100 : 0, {duration: 200});
    opacityAnimation.value = withTiming(listening ? 1 : 0, {duration: 200});
  }, [listening]);

  function getPart(n: number) {
    const mainStyle: any = {
      marginTop: 10,
      fontSize: 15,
      fontWeight: '600',
      color: 'black',
      textAlign: 'center',
    };
    if (!n) {
      //first part
      const part =
        '...' +
        finalText.slice(
          Math.max(finalText.length - 50, 0),
          finalText.lastIndexOf(' ') + 1,
        );
      console.log('part');
      console.log(part);
      return <Text style={mainStyle}>{part}</Text>;
    } else {
      //last word
      const lastword = finalText.slice(
        finalText.lastIndexOf(' ') + 1,
        finalText.length,
      );
      console.log('last');
      console.log(lastword);

      return <Text style={{...mainStyle, color: 'green'}}>{lastword}</Text>;
    }
  }
  const animation = useAnimatedStyle(() => {
    console.log(heightAnimation.value == 200);
    return {
      height: heightAnimation.value,
      opacity: opacityAnimation.value,
    };
  });
  return (
    <View
      style={{
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        width: '100%',
      }}>
      {/* <Button title="Start Transcribing" onPress={start} />
      <Button title="Stop Transcribing" onPress={stop} /> */}
      {/* <Text style={{marginTop: 20, fontSize: 16, color: 'black'}}>
        Partial: {partial}
      </Text> */}
      <Animated.View
        style={[
          {
            width: 200,
            overflow: 'hidden',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: 'black',
            padding: 10,
          },
          animation,
        ]}>
        {listening && (
          <View>
            {partial.length ? (
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 15,
                  fontWeight: '600',
                  color: 'black',
                  textAlign: 'center',
                }}>
                {partial.slice(0, Math.min(partial.length, 50))}
              </Text>
            ) : (
              <Text>
                {getPart(0)} {getPart(1)}
              </Text>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
}
