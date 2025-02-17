import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { setNavigationRef } from './src/services/navigation';

export default function App() {
  // Temporarily remove font loading until we have the correct font
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer ref={setNavigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
