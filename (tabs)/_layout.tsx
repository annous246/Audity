import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from './home/home';
import Adder from './adder/adder';
import {MaterialIcons} from '@react-native-vector-icons/material-icons';
import Words from './words/words';
import Learned from './words/learned';

const TabsLayout = () => {
  const Tabs = createBottomTabNavigator();

  function Icon({
    color,
    focused,
    size,
    name,
    iconName,
  }: {
    color: string;
    focused: boolean;
    size: number;
    name: string;
    iconName: string;
  }) {
    console.log(size);
    console.log(focused);
    return (
      <View style={styles.iconContainer}>
        <MaterialIcons name={iconName} color={color} size={size} />

        <Text
          style={{
            color: focused ? color : 'gray',
            fontSize: 10,
          }}>
          {name}
        </Text>
      </View>
    );
  }

  return (
    <Tabs.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: '#46f28b',
        tabBarInactiveTintColor: '#CFB1B7',
        tabBarStyle: {backgroundColor: 'white'},
      }}>
      <Tabs.Screen
        name="Learned"
        component={Learned}
        options={{
          title: 'Learned',
          headerShown: false,
          tabBarIcon: ({focused, color, size}) => {
            return (
              <Icon
                name="Learned"
                iconName="stars"
                color={color}
                focused={focused}
                size={size}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="Home"
        component={Home}
        options={{
          title: 'Home',
          headerShown: false,

          tabBarIcon: ({focused, color, size}) => {
            return (
              <Icon
                name="Home"
                iconName="house"
                color={color}
                focused={focused}
                size={size}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="Adder"
        component={Adder}
        options={{
          title: 'Adder',
          headerShown: false,
          tabBarIcon: ({focused, color, size}) => {
            return (
              <Icon
                name="Adder"
                iconName="bookmark-add"
                color={color}
                focused={focused}
                size={size}
              />
            );
          },
        }}
      />
    </Tabs.Navigator>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({
  iconContainer: {
    marginTop: 5,
    alignContent: 'center',
    justifyContent: 'center',
    flex: 1,
    width: 50,
    alignItems: 'center',
  },
});
