import {NativeModules} from 'react-native';

const {SpeechModule} = NativeModules;

export const startSpeechService = () => SpeechModule.startService();
export const stopSpeechService = () => SpeechModule.stopService();
export const pauseAudio = () => SpeechModule.pauseAudio();
export const resumeAudio = () => SpeechModule.playAudio();
