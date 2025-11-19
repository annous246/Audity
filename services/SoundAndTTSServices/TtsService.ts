import {HfInference} from '@huggingface/inference';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs'; // npm install react-native-fs

import Config from 'react-native-ultimate-config';
const hf = new HfInference(Config.HF_API_KEY);

export async function speakText(text: string) {
  try {
    // Generate TTS
    const result = await hf.textToSpeech({
      model: 'hexgrad/Kokoro-82M',
      inputs: text,
    });

    // Convert Blob to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];

      // Write temp file
      const path = RNFS.CachesDirectoryPath + '/tts.wav';
      await RNFS.writeFile(path, base64, 'base64');

      // Play the file
      const sound = new Sound(path, '', error => {
        if (error) {
          console.log('Failed to load sound', error);
          return;
        }
        sound.play(success => {
          if (!success) console.log('Playback failed');
          sound.release();
        });
      });
    };
    reader.readAsDataURL(result);
  } catch (err) {
    console.error('TTS error:', err);
  }
}
