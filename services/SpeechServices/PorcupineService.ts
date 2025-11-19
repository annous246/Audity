// PorcupineService.ts
import {
  BuiltInKeywords,
  PorcupineManager,
} from '@picovoice/porcupine-react-native';
import {Alert, DeviceEventEmitter, Platform} from 'react-native';

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
export const startPorcupine = async () => {
  if (manager) return; // already running

  try {
    manager = await PorcupineManager.fromBuiltInKeywords(
      ACCESS_KEY,
      [BuiltInKeywords.ALEXA, BuiltInKeywords.COMPUTER],
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

export const porcStatus = (): boolean => {
  return manager != null;
};
