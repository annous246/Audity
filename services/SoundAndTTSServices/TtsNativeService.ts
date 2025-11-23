import Tts from 'react-native-tts';

// Set default options
Tts.setDefaultLanguage('en-US');
Tts.setDefaultRate(0.5);
Tts.setDefaultPitch(1.0);

import ForegroundService from '@supersami/rn-foreground-service';
// Speak a text
export function speakText(text: string) {
  Tts.stop(); // stop any ongoing speech
  Tts.speak(text);
}

// Optional: stop speech
export function stopSpeaking() {
  Tts.stop();
}
export async function speakAsyncTTS(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Event fired when speech finishes
    const finishListener: any = Tts.addEventListener('tts-finish', () => {
      finishListener.remove(); // cleanup
      resolve();
    });

    const errorListener: any = Tts.addEventListener('tts-error', err => {
      errorListener.remove();
      reject(err);
    });

    Tts.speak(text);
  });
}

export function speak(text: string) {
  ForegroundService.start({
    id: 204,
    title: 'Speaking...',
    message: 'TTS is running in background',
  });

  // Trigger the TTS
  speakText(text);
}
export async function speakAsync(text: string) {
  ForegroundService.start({
    id: 205,
    title: 'Speaking...',
    message: 'TTS is running in background',
  });

  // Trigger the TTS
  await speakAsyncTTS(text);
}

// Optional: listen to events
Tts.addEventListener('tts-start', event => console.log('TTS started'));
Tts.addEventListener('tts-finish', event => console.log('TTS finished'));
Tts.addEventListener('tts-cancel', event => console.log('TTS cancelled'));
