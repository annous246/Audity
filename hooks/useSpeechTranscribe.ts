// useSpeechTranscribe.ts
import {useEffect, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';

export function useSpeechTranscribe() {
  const [partial, setPartial] = useState('');
  const [finalText, setFinalText] = useState('');

  useEffect(() => {
    const sub1 = DeviceEventEmitter.addListener(
      'TranscriptionPartial',
      (text: string) => setPartial(text),
    );
    const sub2 = DeviceEventEmitter.addListener(
      'TranscriptionResult',
      (text: string) => {
        setFinalText(prev => prev + ' ' + text);
        setPartial('');
      },
    );
    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  return {partial, finalText, setFinalText};
}
