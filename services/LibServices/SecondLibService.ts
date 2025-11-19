import axios from 'axios';
import {meaningType} from '../../types/types';
import Config from 'react-native-ultimate-config';
import {playAudio} from '../SoundAndTTSServices/SoundService';

export async function getMeaningApi2(word: string): Promise<meaningType> {
  try {
    const res = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
    );
    console.log(res.data);
    console.log(res.data[0]);
    const ret: any = Array.isArray(res.data) ? res.data[0] : null;
    console.log(ret);
    console.log('ret');
    if (!ret) return {ok: false, result: ''};
    //treat the object
    //search for array
    let def = '';
    const synonyms: string[] = ret['meanings'][0]['synonyms'];
    console.log(synonyms);
    for (const defobj of ret['meanings'][0]['definitions']) {
      if (defobj['definition'].length) {
        console.log('here ******');
        console.log(defobj);
        def = defobj['definition'];
        break;
      }
    }
    return {
      ok: true,
      result: {meta: {syns: [synonyms]}, shortdef: [def]},
    };
  } catch (e) {
    return {
      ok: 0,
      result: '',
    };
  }
}

export async function pronounce(word: string): Promise<void> {
  try {
    const res = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
    );

    const ret: any = Array.isArray(res.data) ? res.data[0] : null;

    if (!ret) return;
    //treat the object
    //search for array
    let link: string | null = null;
    for (const objlink of ret['phonetics']) {
      if (objlink['audio'].length) {
        link = objlink['audio'];
        break;
      }
    }
    if (link) {
      //call sound service
      await playAudio(link);
      console.log('pron done');
    } else {
      throw Error('no link available');
    }
  } catch (e: any) {
    console.log('error pron : ' + e.message);
  }
}

export async function audioAvailable(word: string): Promise<boolean> {
  try {
    const res = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
    );

    const ret: any = Array.isArray(res.data) ? res.data[0] : null;

    if (!ret) return false;
    //treat the object
    //search for array
    let link: string | null = null;
    for (const objlink of ret['phonetics']) {
      if (objlink['audio'].length) {
        link = objlink['audio'];
        break;
      }
    }
    return link != null;
  } catch (e: any) {
    return false;
  }
}
