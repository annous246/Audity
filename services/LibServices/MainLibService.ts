import axios from 'axios';
import {meaningType} from '../../types/types';
import Config from 'react-native-ultimate-config';

export async function getMeaningApi1(word: string): Promise<meaningType> {
  try {
    const dict_api_key = Config.DICT_API_KEY;
    const res = await axios.get(
      `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=${dict_api_key}`,
    );
    return {ok: typeof res.data[0] != 'string', result: res.data[0]};
  } catch (e) {
    return {
      ok: 0,
      result: '',
    };
  }
}

export function explain(data: any) {
  console.log(data);
  console.log(data['meta']['syns'][0]);
  return [data['shortdef'][0], data['meta']['syns'][0]];
}
