import {DeviceEventEmitter, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Words from './words';
import {wordType} from '../../types/types';

const Learned = () => {
  const [data, setData] = useState<wordType[]>([
    {
      id: 1,
      word: 'swift',
      synonyms: ['quick', 'rapid', 'speedy', 'brisk'],
      definition:
        'Moving or capable of moving at high speed.Moving or capable of moving at high speed',
    },
    {
      id: 2,
      word: 'serene',
      synonyms: [
        'calm',
        'peaceful',
        'tranquil',
        'untroubled',
        'calm',
        'peaceful',
        'tranquil',
        'untroubled',
      ],
      definition: 'Free from disturbance; quiet and peaceful.',
    },
    {
      id: 3,
      word: 'vigor',
      synonyms: ['energy', 'strength', 'force', 'power'],
      definition: 'Physical strength and good health.',
    },
    {
      id: 4,
      word: 'dazzle',
      synonyms: ['astonish', 'impress', 'amaze', 'bedazzle'],
      definition: 'To greatly impress or overwhelm with brilliance.',
    },
    {
      id: 5,
      word: 'gleam',
      synonyms: ['shine', 'glow', 'sparkle', 'glimmer'],
      definition: 'A faint or brief light; a small flash of brightness.',
    },
    {
      id: 6,
      word: 'ponder',
      synonyms: ['reflect', 'think', 'contemplate', 'consider'],
      definition: 'To think deeply about something.',
    },
    {
      id: 7,
      word: 'azdazd',
      synonyms: ['reflect', 'think', 'contemplate', 'consider'],
      definition: 'To think deeply about something.',
    },
  ]);

  useEffect(() => {
    DeviceEventEmitter.addListener('NewWord', (data: string) => {
      setData((prev: wordType[]) => {
        return [
          ...prev,
          {
            id: prev[prev.length - 1].id + 1,
            word: data,
            definition: 'test',
            synonyms: [],
          },
        ];
      });
    });
  }, []);
  //KEY IS CRUTIAL FOR REAL TIME RERENDER
  return <Words key={data.length} data={data} />;
};

export default Learned;

const styles = StyleSheet.create({});
