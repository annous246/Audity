import {DeviceEventEmitter} from 'react-native';
import {explain, getMeaningApi1} from '../services/LibServices/MainLibService';
import {getMeaningApi2} from '../services/LibServices/SecondLibService';
import {
  speak,
  speakAsync,
} from '../services/SoundAndTTSServices/TtsNativeService';
import {meaningType} from '../types/types';
import {
  pauseAudio,
  resumeAudio,
  startSpeechService,
} from '../services/SpeechServices/SpeechService';
import {
  startPorcupineBackground,
  stopPorcupine,
} from '../services/SpeechServices/PorcupineService';

async function realTimeExplain(
  result: any,
  setSynonyms: any,
  setDefinition: any,
  instantStop: React.MutableRefObject<boolean>,
) {
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
    return;
  }
  await speakAsync('synonyms ');
  if (instantStop.current) {
    return;
  }
  if (!syns.length) return;
  for (const syn of syns) {
    console.log(syn);
    await speakAsync(syn);
    console.log(instantStop.current);
    if (instantStop.current) {
      return;
    }
  }
}

export async function handleSpeechStop(
  setSynonyms: any,
  setDefinition: any,
  setWord: any,
  instantStop: React.MutableRefObject<boolean>,
  startKeyWord: string,
  alreadyCalled: React.MutableRefObject<boolean>,
) {
  //safety against double call
  if (alreadyCalled.current) return;
  alreadyCalled.current = true;
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
  if (!instantStop.current) await startPorcupineBackground(startKeyWord);
  console.log('result2');
  console.log('result');
  console.log(instantStop.current);
  //if not on the app  -> we call it on background after same delay
  if (instantStop.current) {
    instantStop.current = false;
    return;
  }

  //speech might start  -> pause audio again to listen to results
  await pauseAudio();

  if (!result.ok && !result2.ok) {
    speak(
      `sorry didnt understand the word ${extracted_from_prev} Did you mean ${result.result} ?`,
    );

    if (!instantStop.current) {
      console.log('resume');
      await resumeAudio();
    }
  } else if (result.ok) {
    console.log('got  it');
    const [currentDefinition, syns] = explain(result.result);
    await realTimeExplain(
      result.result,
      setSynonyms,
      setDefinition,
      instantStop,
    );
    if (instantStop.current) {
      instantStop.current = false;
      return;
    }
    if (!instantStop.current) {
      console.log('resume1');
      await resumeAudio();
    }
    //add new word in list realtime

    DeviceEventEmitter.emit('NewWord', {
      word: extracted_from_prev,
      synonyms: syns,
      definition: currentDefinition,
    });
  } else {
    const [currentDefinition, syns] = explain(result2.result);
    await realTimeExplain(
      result2.result,
      setSynonyms,
      setDefinition,
      instantStop,
    );

    if (!instantStop.current) {
      console.log('resume2');
      await resumeAudio();
    }
    DeviceEventEmitter.emit('NewWord', {
      word: extracted_from_prev,
      synonyms: syns,
      definition: currentDefinition,
    });

    //explanation done -> resume
  }

  //this is CRUTIAL + TIMEOUT AS SPEECH SERVICE TAKES TIME TO ACTUALLY CLEAR AUDIO STREAM !!!!!!
  if (instantStop.current) {
    instantStop.current = false;
    return;
  }
  alreadyCalled.current = false;
}

export async function handleKeywordDetection(
  setWord: any,
  setDefinition: any,
  setSynonyms: any,
  instantStop: React.MutableRefObject<boolean>,
  setListening: any,
  alreadyCalled: React.MutableRefObject<boolean>,
) {
  speak('Hello , whats the ambiguous word ');

  setWord('');
  setDefinition('');
  setSynonyms([]);
  instantStop.current = false;
  alreadyCalled.current = false;
  // await sleep(1000); DaNGEROUS IF STARTED REST WILL ONLY WORK IN BG
  setListening(true);
  await stopPorcupine();
  await startSpeechService();
  await pauseAudio();
}

export async function handleSpeechInterrupt(
  setListening: any,
  instantStop: React.MutableRefObject<boolean>,
  alreadyCalled: React.MutableRefObject<boolean>,
) {
  instantStop.current = true;
  alreadyCalled.current = false;
  speak('im listening');

  // await sleep(1000); DANGEROUS IF STARTED REST WILL ONLY WORK IN BG
  setListening(true);
  await stopPorcupine();
  await startSpeechService();
  await pauseAudio();
}
