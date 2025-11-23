// PorcupineService.ts
import {
  BuiltInKeywords,
  PorcupineManager,
} from '@picovoice/porcupine-react-native';
import {Alert, DeviceEventEmitter, Platform} from 'react-native';

import BackgroundService from 'react-native-background-actions';
import Config from 'react-native-ultimate-config';

console.log('ACCESS_KEY');
console.log(Config);
const ACCESS_KEY = Config.PORCUPINE_API_KEY ?? '';
const KEYWORDS = ['stop_android.ppn'];
console.log('ACCESS_KEY');
console.log(ACCESS_KEY);
let manager: PorcupineManager | null = null;
import {AppRegistry} from 'react-native';

AppRegistry.registerHeadlessTask('SomeTask', () => async () => {
  console.log('Running in background!');
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const backgroundPorcupineStart = async (word: string) => {
  await sleep(2000);
  await startPorcupine(word);
};
export const startPorcupine = async (word: string) => {
  if (manager) return; // already running
  //if (!(word in BuiltInKeywords))
  try {
    manager = await PorcupineManager.fromBuiltInKeywords(
      ACCESS_KEY,
      [
        BuiltInKeywords[word as keyof typeof BuiltInKeywords],
        BuiltInKeywords.COMPUTER,
      ],
      (keywordIndex: number) => {
        console.log('Keyword detected!', keywordIndex);
        // Emit to JS
        if (keywordIndex == 0)
          DeviceEventEmitter.emit('KeywordDetected', keywordIndex);
        if (keywordIndex == 1)
          DeviceEventEmitter.emit('stopDetected', keywordIndex);
        Alert.alert('Keyword Detected', 'Keyword recognized!');
      },
    );

    await manager.start();
    console.log('Porcupine started');
  } catch (e) {
    console.error('Failed to start Porcupine', e);
  }
};

export const stopPorcupine = async () => {
  if (!manager) return;

  try {
    await manager.stop();
    if (manager) manager.delete();
    manager = null;
    console.log('Porcupine stopped');
  } catch (e) {
    console.error('Failed to stop Porcupine', e);
  }
};

export const startPorcupineBackground = async (word: string) => {
  await BackgroundService.start(
    async () => {
      await backgroundPorcupineStart(word);
    },
    {
      taskName: 'MyBackgroundTask',
      taskTitle: 'Background Running',
      taskDesc: 'Your function is running even in background.',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      parameters: {},
    },
  );
};

export const porcStatus = (): boolean => {
  return manager != null;
};
