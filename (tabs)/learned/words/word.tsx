import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {wordType} from '../../../types/types';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Contents from '../contents';
import HorizontalLine from '../../../components/horizontalLine';
import Synonyms from '../synonyms';

const Word = ({item}: {item: wordType}) => {
  const animatedHeight = useSharedValue(300);
  const animatedOpacity = useSharedValue(0);
  const [measurement, setMeasurement] = useState<number>(0);
  const [synHeight, setSynHeight] = useState<number>(0);
  const heightAnimated = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value,
      opacity: animatedOpacity.value,
    };
  });

  function handleHeights(e: number) {
    animatedHeight.value = e + 10;
    animatedOpacity.value = withTiming(1, {duration: 200});
    setMeasurement(e + 50);
  }
  function handleClick() {
    animatedHeight.value = withTiming(
      measurement >= animatedHeight.value
        ? measurement + synHeight
        : measurement - 40,
      {duration: 200},
    );
  }
  return (
    <Animated.View style={[styles.wordComponent, heightAnimated]}>
      <TouchableOpacity
        onPress={handleClick}
        onLayout={e => handleHeights(e.nativeEvent.layout.height)}>
        <Contents word={item.word} definition={item.definition} />
        <HorizontalLine
          borderRadius={100}
          height={3}
          width={'40%'}
          color="#80ce40ff"
          marginTop={15}
          marginBottom={20}
          alignSelf={'center'}
        />
      </TouchableOpacity>

      <Synonyms id={item.id} syns={item.synonyms} setSynHeight={setSynHeight} />
    </Animated.View>
  );
};

export default Word;

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
