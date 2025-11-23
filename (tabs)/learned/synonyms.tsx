import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import mainStyles from '../../styles';
const Synonyms = ({
  syns,
  setSynHeight,
  id,
}: {
  syns: string[];
  setSynHeight: any;
  id: number;
}) => {
  const [learned, setLearned] = useState<boolean>(false);
  function handleHeights(height: number) {
    setSynHeight(height);
  }

  return (
    <View>
      <View style={[mainStyles.row, styles.container]}>
        {syns.map((e, i) => (
          <Text
            key={i}
            style={[
              mainStyles.defaultText,
              styles.syn,
              {
                backgroundColor: learned ? '#55ac0e60' : '#d4d2d2ff',
                fontWeight: '300',
              },
            ]}>
            {e}
          </Text>
        ))}
      </View>
      <View
        style={[mainStyles.row, styles.container, styles.visibility]}
        onLayout={e => handleHeights(e.nativeEvent.layout.height)}>
        {syns.map((e, i) => (
          <Text key={i} style={[mainStyles.defaultText, styles.syn]}>
            {e}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default Synonyms;

const styles = StyleSheet.create({
  visibility: {
    opacity: 0,
    position: 'absolute',
    color: 'white',
    zIndex: -99999,
  },
  syn: {
    backgroundColor: '#d4d2d2ff',
    borderRadius: 5,
    padding: 5,
    paddingLeft: 12,
    paddingRight: 12,
    margin: 10,
    color: '#636566ff',
  },
  container: {
    margin: 20,
    padding: 10,
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    height: 'auto',
  },
});
