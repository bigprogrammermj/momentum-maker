import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleAlarm, cancelAlarm, setupNotifications } from '../services/alarm';
import { onTimeSelected } from '../services/navigation';

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

interface MainScreenProps {
  alarmTime: string;
  isAlarmActive: boolean;
  onToggleAlarm: () => void;
}

export function MainScreen() {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const [isAlarmActive, setIsAlarmActive] = React.useState(false);
  const [alarmTime, setAlarmTime] = React.useState('07:00');

  useEffect(() => {
    loadAlarmState();
    setupNotifications();

    // Event-Listener für die Zeitauswahl
    const unsubscribe = onTimeSelected(async (time: string) => {
      setAlarmTime(time);
      await AsyncStorage.setItem('alarmTime', time);
      if (isAlarmActive) {
        scheduleAlarm(time);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAlarmActive]);

  const loadAlarmState = async () => {
    try {
      const savedAlarmTime = await AsyncStorage.getItem('alarmTime');
      const savedAlarmActive = await AsyncStorage.getItem('alarmActive');
      
      if (savedAlarmTime) {
        setAlarmTime(savedAlarmTime);
      }
      if (savedAlarmActive === 'true') {
        setIsAlarmActive(true);
        scheduleAlarm(savedAlarmTime || alarmTime);
      }
    } catch (error) {
      console.error('Error loading alarm state:', error);
    }
  };

  const handleToggleAlarm = async () => {
    const newState = !isAlarmActive;
    setIsAlarmActive(newState);
    
    try {
      await AsyncStorage.setItem('alarmActive', newState.toString());
      
      if (newState) {
        const success = await scheduleAlarm(alarmTime);
        if (!success) {
          setIsAlarmActive(false);
          await AsyncStorage.setItem('alarmActive', 'false');
        }
      } else {
        await cancelAlarm();
      }
    } catch (error) {
      console.error('Error toggling alarm:', error);
      setIsAlarmActive(!newState);
    }
  };

  const handleSetTime = () => {
    navigation.navigate('TimeSelection', {
      initialTime: alarmTime,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>MOMENTUM MAKER</Text>

        <View style={styles.content}>
          <View style={styles.timeContainer}>
            <Text style={[styles.time, { textShadowColor: '#98FB98', textShadowRadius: 10 }]}>
              {alarmTime}
            </Text>
            <Feather 
              name="bell" 
              size={40} 
              color="#FF4444" 
              style={{ opacity: isAlarmActive ? 1 : 0.3 }}
            />
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleSetTime}
          >
            <Text style={styles.buttonText}>SET TIME</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('QuizSettings')}
          >
            <Text style={styles.buttonText}>QUIZ SETTINGS</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.buttonText}>EMAIL SETTINGS</Text>
          </TouchableOpacity>

          <View style={styles.controlsContainer}>
            <View style={styles.controlGroup}>
              <TouchableOpacity 
                style={styles.toggleContainer} 
                onPress={handleToggleAlarm}
              >
                <View style={[
                  styles.toggle,
                  { backgroundColor: isAlarmActive ? '#FF4444' : '#2D1E1E' },
                  { transform: [{ translateX: isAlarmActive ? 30 : 0 }] }
                ]} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.status}>
            {isAlarmActive ? `ARMED ${alarmTime}` : 'UNARMED'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: 32,
  },
  title: {
    fontSize: 28,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 48,
    fontFamily: 'DSEG7Classic-Regular',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  time: {
    fontSize: 64,
    color: '#FF4444',
    fontFamily: 'DSEG7Classic-Regular',
  },
  toggleContainer: {
    width: 80,
    height: 40,
    backgroundColor: '#2D1E1E',
    borderRadius: 20,
    justifyContent: 'center',
    padding: 4,
  },
  toggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  button: {
    width: '100%',
    maxWidth: 300,
    height: 64,
    backgroundColor: '#2D1E1E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    color: '#FF4444',
    fontFamily: 'DSEG7Classic-Regular',
    textShadowColor: '#FF4444',
    textShadowRadius: 8,
  },
  status: {
    textAlign: 'center',
    fontSize: 20,
    color: '#FF4444',
    fontFamily: 'DSEG7Classic-Regular',
    marginBottom: 16,
  },
  controlsContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    marginTop: 32,
  },
  controlGroup: {
    alignItems: 'center',
    gap: 8,
  },
  warningLabel: {
    fontSize: 16,
    color: '#FF4444',
    fontFamily: 'DSEG7Classic-Regular',
    textAlign: 'center',
  },
}); 