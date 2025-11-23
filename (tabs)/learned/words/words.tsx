import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  FlatList,
  Touchable,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Synonyms from '../synonyms';
import HorizontalLine from '../../../components/horizontalLine';
import Contents from '../contents';
import {wordType} from '../../../types/types';
import Word from './word';
import {data} from './testdata';
const {height: screenHeight, width: screenWidth} = Dimensions.get('window');

const Words = () => {
  const [words, setWords] = useState<wordType[]>(data);

  const renderWord = React.useCallback(({item}: {item: wordType}) => {
    return <Word key={item.id} item={item} />;
  }, []);
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'NewWord',
      (data: wordType) => {
        setWords((prev: wordType[]) => {
          return [
            ...prev,
            {
              id: prev[prev.length - 1].id + 1,
              word: data.word,
              definition: data.definition,
              synonyms: data.synonyms,
            },
          ];
        });
      },
    );
    //  setRenderStatus(true);
    return () => {
      subscription.remove();
    };
  }, []);
  return (
    <FlatList
      data={words}
      style={{height: screenHeight - 310}}
      renderItem={renderWord}
      keyExtractor={item => item.id.toString()} // Assuming `id` is a unique identifier for each item
      contentContainerStyle={styles.flatListContent}
      ListEmptyComponent={<Text>Empty List</Text>}
      initialNumToRender={5} // Render a small number initially
      windowSize={5} // Adjust this for smoother scrolling
      maxToRenderPerBatch={5} // Control the maximum number of items rendered in a batch
      onEndReachedThreshold={0.1} // Trigger `onEndReached` when the end is 10% away
    />
  );
};

export default Words;

const styles = StyleSheet.create({
  wordComponent: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: 'white',
    elevation: 5,
    padding: 10,
    margin: 10,
    borderRadius: 8,
    opacity: 0,
    height: 'auto',
  },
  flatListContent: {},
});
