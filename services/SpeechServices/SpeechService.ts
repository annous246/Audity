import {NativeModules} from 'react-native';

const {SpeechModule} = NativeModules;

export const startSpeechService = () => SpeechModule.startService();
export const stopSpeechService = () => SpeechModule.stopService();
