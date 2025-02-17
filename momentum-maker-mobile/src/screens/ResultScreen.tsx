import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Feather } from '@expo/vector-icons';

type ResultScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Result'>;
type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

export function ResultScreen() {
  const navigation = useNavigation<ResultScreenNavigationProp>();
  const route = useRoute<ResultScreenRouteProp>();
  const { success } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Feather
          name={success ? 'check-circle' : 'x-circle'}
          size={80}
          color={success ? '#98FB98' : '#FB9898'}
          style={styles.icon}
        />
        <Text style={styles.title}>
          {success ? 'WAKE UP!' : 'KEEP SLEEPING...'}
        </Text>
        <Text style={styles.subtitle}>
          {success ? 'You completed the quiz!' : 'Try again tomorrow!'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.buttonText}>BACK TO ALARM</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 32,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  icon: {
    marginBottom: 16,
    textShadowColor: '#98FB98',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  title: {
    fontSize: 32,
    color: '#98FB98',
    textAlign: 'center',
    fontFamily: 'DSEG7Classic-Regular',
    textShadowColor: '#98FB98',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#98FB98',
    textAlign: 'center',
    opacity: 0.8,
    fontFamily: 'DSEG7Classic-Regular',
  },
  button: {
    width: '100%',
    height: 64,
    backgroundColor: '#1C2611',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    color: '#98FB98',
    fontFamily: 'DSEG7Classic-Regular',
    textShadowColor: '#98FB98',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
}); 