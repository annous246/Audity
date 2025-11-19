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
