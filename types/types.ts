export interface meaningResultType {
  meta: {syns: string[][]};
  shortdef: string[];
}
export interface meaningType {
  ok: number | boolean;
  result: meaningResultType | string;
}
export interface wordType {
  id: number;
  word: string;
  synonyms: string[];
  definition: string;
}

export enum PorcupineBuiltInType {
  ALEXA = 'alexa',
  AMERICANO = 'americano',
  BLUEBERRY = 'blueberry',
  BUMBLEBEE = 'bumblebee',
  COMPUTER = 'computer',
  GRAPEFRUIT = 'grapefruit',
  GRASSHOPPER = 'grasshopper',
  HEY_GOOGLE = 'hey google',
  HEY_SIRI = 'hey siri',
  JARVIS = 'jarvis',
  OK_GOOGLE = 'ok google',
  PICOVOICE = 'picovoice',
  PORCUPINE = 'porcupine',
  TERMINATOR = 'terminator',
}
