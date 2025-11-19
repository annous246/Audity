import {
  DeviceEventEmitter,
  ImageBackground,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import icons from '../../constants/icons';
import {
  pronounce,
  audioAvailable,
} from '../../services/LibServices/SecondLibService';
import {opacity} from 'react-native-reanimated/lib/typescript/Colors';
const Contents = ({word, definition}: {word: string; definition: string}) => {
  const [good, setGood] = useState<boolean>(false);
  const mainContainer = useRef<any>(null);
  useEffect(() => {
    available();
  }, []);
  async function available(): Promise<void> {
    const res = await audioAvailable(word);

    setGood(res);
  }
  async function handlePronounce() {
    if (!good) return;
    await pronounce(word ?? 'word');
  }
  return (
    <View ref={mainContainer}>
      <View
        style={{
          flexDirection: 'row',
          alignContent: 'flex-start',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          width: '100%',
        }}>
        <Text
          style={[
            styles.defaultText,
            styles.word,
            {
              alignSelf: 'flex-start',
              color: '#80ce40ff',
              width: '90%',
            },
          ]}>
          {word.toUpperCase()}
        </Text>
        <TouchableOpacity
          style={{
            height: 30,
            width: 30,
          }}
          onPress={handlePronounce}>
          <ImageBackground
            source={icons.volume}
            tintColor={good ? 'black' : '#a39b9b86'}
            style={{width: '100%', height: '100%'}}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.defaultText, styles.definition]}>
        {definition + '...'}
      </Text>
    </View>
  );
};

export default Contents;

const styles = StyleSheet.create({
  word: {
    fontWeight: 'bold',
  },
  flatListContent: {},
  defaultText: {color: 'black', fontSize: 15},
  definition: {fontSize: 11},
});
