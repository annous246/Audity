import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {AuthProvider} from './contexts/AuthProvider';
import AppLayout from './_layout';
import {NavigationContainer} from '@react-navigation/native';

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppLayout />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
