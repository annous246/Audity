import {DeviceEventEmitter} from 'react-native';
import {explain, getMeaningApi1} from '../services/LibServices/MainLibService';
import {getMeaningApi2} from '../services/LibServices/SecondLibService';
import {
  speak,
  speakAsync,
} from '../services/SoundAndTTSServices/TtsNativeService';
import {meaningType} from '../types/types';
import {startSpeechService} from '../services/SpeechServices/SpeechService';
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

export async function handleSpeechStop(
  setSynonyms: any,
  setDefinition: any,
  setWord: any,
  instantStop: React.MutableRefObject<boolean>,
  startKeyWord: string,
) {
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
  if (!instantStop.current) await startPorcupineBackground(startKeyWord);
  if (!result.ok && !result2.ok) {
    return speak(
      `sorry didnt understand the word ${extracted_from_prev} Did you mean ${result.result} ?`,
    );
  } else if (result.ok) {
    console.log('got  it');
    const [currentDefinition, syns] = explain(result.result);
    await realTimeExplain(
      result.result,
      setSynonyms,
      setDefinition,
      instantStop,
    );
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
    DeviceEventEmitter.emit('NewWord', {
      word: extracted_from_prev,
      synonyms: syns,
      definition: currentDefinition,
    });
  }

  //this is CRUTIAL + TIMEOUT AS SPEECH SERVICE TAKES TIME TO ACTUALLY CLEAR AUDIO STREAM !!!!!!
  if (instantStop.current) {
    instantStop.current = false;
    return;
  }
}

export async function handleKeywordDetection(
  setWord: any,
  setDefinition: any,
  setSynonyms: any,
  instantStop: React.MutableRefObject<boolean>,
  setListening: any,
) {
  speak('Hello , whats the ambiguous word ');

  setWord('');
  setDefinition('');
  setSynonyms([]);
  instantStop.current = false;
  // await sleep(1000); DaNGEROUS IF STARTED REST WILL ONLY WORK IN BG
  setListening(true);
  await stopPorcupine();
  await startSpeechService();
}

export async function handleSpeechInterrupt(
  setListening: any,
  instantStop: React.MutableRefObject<boolean>,
) {
  instantStop.current = true;
  speak('im listening');

  // await sleep(1000); DANGEROUS IF STARTED REST WILL ONLY WORK IN BG
  setListening(true);
  await stopPorcupine();
  await startSpeechService();
}
