import { createStackNavigator } from '@react-navigation/stack';
import { MainScreen } from '../screens/MainScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { TimeSelectionScreen } from '../screens/TimeSelectionScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { QuizSettingsScreen } from '../screens/QuizSettingsScreen';
import { BackHandler, Platform } from 'react-native';
import { useEffect } from 'react';

export type RootStackParamList = {
  Main: undefined;
  TimeSelection: {
    initialTime: string;
  };
  Quiz: undefined;
  Settings: undefined;
  QuizSettings: undefined;
  Result: {
    success: boolean;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

// Komponente zum Sperren der Navigation
function QuizScreenWithLock(props: any) {
  useEffect(() => {
    // BackHandler nur für Android
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // Verhindere das Zurückgehen während des Quiz
        return true;
      });

      return () => backHandler.remove();
    }
  }, []);

  return <QuizScreen {...props} />;
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000' }
      }}
    >
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Quiz" component={QuizScreenWithLock} />
      <Stack.Screen name="TimeSelection" component={TimeSelectionScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="QuizSettings" component={QuizSettingsScreen} />
    </Stack.Navigator>
  );
} 