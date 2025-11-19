import {FlexAlignType, StyleSheet, Text, View} from 'react-native';
import React from 'react';

const HorizontalLine = ({
  height = 5,
  width = '100%',
  color = 'black',
  borderRadius = 0,
  marginTop = 0,
  alignSelf = 'auto',
  marginBottom = 0,
}: {
  height?: number;
  width?: any;
  borderRadius?: number;
  marginTop?: number;
  marginBottom?: number;
  alignSelf?: 'auto' | FlexAlignType | undefined;
  color?: string;
}) => {
  const style = {
    height: height,
    width: width,
    backgroundColor: color,
    borderRadius: borderRadius,
    marginTop: marginTop,
    marginBottom: marginBottom,
  };
  return (
    <View
      style={{
        height: style.height,
        width: style.width,
        backgroundColor: style.backgroundColor,
        position: 'relative',
        borderRadius: style.borderRadius,
        marginTop: style.marginTop,
        marginBottom: style.marginBottom,
        alignSelf: alignSelf,
      }}></View>
  );
};

export default HorizontalLine;

const styles = StyleSheet.create({});
