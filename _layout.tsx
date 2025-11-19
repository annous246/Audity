import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabsLayout from './(tabs)/_layout';

const AppLayout = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="(tabs)"
        component={TabsLayout}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default AppLayout;

const styles = StyleSheet.create({});
