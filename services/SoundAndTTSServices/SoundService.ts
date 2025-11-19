import Sound from 'react-native-sound';

export function playAudio(url: string) {
  console.log('here************');
  console.log(url);
  const sound = new Sound(url, undefined, error => {
    if (error) {
      console.log('Failed to load the sound', error);
      return;
    }
    // Play the sound
    sound.play(success => {
      if (success) {
        console.log('Successfully finished playing');
      } else {
        console.log('Playback failed due to audio decoding errors');
      }
      sound.release(); // free resources
    });
  });
}
