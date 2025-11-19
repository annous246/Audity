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
import Synonyms from './synonyms';
import HorizontalLine from '../../components/horizontalLine';
import Contents from './contents';
import {wordType} from '../../types/types';
const {height: screenHeight, width: screenWidth} = Dimensions.get('window');

const Words = ({data}: {data: wordType[]}) => {
  const animatedHeights = useRef<SharedValue<number>[]>(
    [...data, {}].map(v => useSharedValue(300)),
  );
  const [measurements, setMeasurements] = useState<number[]>(
    data.length ? new Array(data.length + 1).fill(0) : [],
  );
  const [synHeights, setSynHeights] = useState<number[]>(
    data.length ? new Array(data.length + 1).fill(0) : [],
  );
  const [words, setWords] = useState<wordType[]>(data);
  const [lockAnimatedInitials, setLockAnimatedInitials] =
    useState<boolean>(false);
  const opacityAnimation = useSharedValue(0);

  function handleHeights(e: number, id: number) {
    console.log('height');
    console.log(e);
    if (lockAnimatedInitials) return;
    setMeasurements((prev: number[]) => {
      return [...prev.slice(0, id), e + 50, ...prev.slice(id + 1, prev.length)];
    });
    console.log(measurements);
  }
  useEffect(() => {}, []);
  useEffect(() => {
    // animatedHeights.current = measurements.map(val => useSharedValue(val));
    if (lockAnimatedInitials) return;
    if (measurements[measurements.length - 1]) {
      //done gettinf renders
      measurements.map((v, i) => {
        if (i) {
          if (animatedHeights.current[i]) {
            console.log('index');
            console.log(i);
            console.log(v);
            if (v) animatedHeights.current[i].value = v - 40;
          }
        }
      });

      //lets display now
      opacityAnimation.value = withTiming(1, {duration: 100});
      setLockAnimatedInitials(true);
    }
  }, [measurements]);
  useEffect(() => {
    console.log(synHeights);
  }, [synHeights]);
  const heightAnimated = words.map((_, i) =>
    useAnimatedStyle(() => {
      return {
        height: animatedHeights.current[i + 1].value,
        opacity: opacityAnimation.value,
      };
    }),
  );
  function handleClick(id: number) {
    // console.log('here');
    // console.log(animatedHeights.current[id]);
    // console.log(measurements[id] + 80);
    if (animatedHeights.current[id]) {
      console.log('measurements[id]***********');
      console.log(measurements[id]);
      console.log(animatedHeights.current[id].value);
      animatedHeights.current[id].value = withTiming(
        measurements[id] >= animatedHeights.current[id].value
          ? measurements[id] + synHeights[id]
          : measurements[id] - 40,
        {
          duration: 200,
        },
      );
    }
  }
  function renderWord({item}: {item: wordType}) {
    return (
      //  heightAnimated[item.id - 1]
      <Animated.View
        style={[styles.wordComponent, heightAnimated[item.id - 1]]}>
        <TouchableOpacity
          onPress={() => handleClick(item.id)}
          onLayout={e => handleHeights(e.nativeEvent.layout.height, item.id)}>
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

        <Synonyms
          id={item.id}
          syns={item.synonyms}
          setSynHeights={setSynHeights}
        />
      </Animated.View>
    );
  }
  return (
    <FlatList
      data={words}
      style={{height: screenHeight - 310}}
      renderItem={renderWord}
      keyExtractor={item => item.id.toString()} // Assuming `id` is a unique identifier for each item
      contentContainerStyle={styles.flatListContent}
      ListEmptyComponent={<Text>Empty List</Text>}
      initialNumToRender={10} // Render a small number initially
      windowSize={7} // Adjust this for smoother scrolling
      maxToRenderPerBatch={7} // Control the maximum number of items rendered in a batch
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
