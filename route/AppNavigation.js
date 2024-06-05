import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {LogBox, Text, View} from 'react-native';
import Home from '../screens/Home';

const Stack = createStackNavigator();

LogBox.ignoreAllLogs([
  'Non-serializable values were fond in the navigation state',
]);

export default function AppNaviagtion() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
