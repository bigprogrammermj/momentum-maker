import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, NativeScrollEvent, NativeSyntheticEvent, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { emitTimeSelected } from '../services/navigation';

type TimeSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TimeSelection'>;

interface TimeSelectionScreenProps {
  route: {
    params: {
      initialTime: string;
    };
  };
}

export function TimeSelectionScreen({ route }: TimeSelectionScreenProps) {
  const navigation = useNavigation<TimeSelectionScreenNavigationProp>();
  const { initialTime } = route.params;
  const [selectedHour, setSelectedHour] = useState(Number.parseInt(initialTime.split(':')[0]));
  const [selectedMinute, setSelectedMinute] = useState(Number.parseInt(initialTime.split(':')[1]));

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    const time = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    emitTimeSelected(time);
    navigation.goBack();
  };

  const handleHourScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const selectedIndex = Math.round(y / 80);
    if (selectedIndex >= 0 && selectedIndex < 24) {
      setSelectedHour(selectedIndex);
    }
  };

  const handleMinuteScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const selectedIndex = Math.round(y / 80);
    if (selectedIndex >= 0 && selectedIndex < 60) {
      setSelectedMinute(selectedIndex);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.headerButton}>Abbrechen</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.headerButton}>Sichern</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{selectedHour.toString().padStart(2, '0')}</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.timeText}>{selectedMinute.toString().padStart(2, '0')}</Text>
        </View>

        <View style={styles.pickerContainer}>
          <View style={styles.selectionBar} />
          <ScrollView 
            style={styles.pickerColumn}
            showsVerticalScrollIndicator={false}
            snapToInterval={80}
            decelerationRate="fast"
            onScroll={handleHourScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.pickerPadding} />
            {hours.map((hour) => (
              <View
                key={hour}
                style={[
                  styles.timeOption,
                  selectedHour === hour && styles.selectedTimeOption
                ]}
              >
                <Text style={[
                  styles.timeOptionText,
                  selectedHour === hour && styles.selectedTimeOptionText
                ]}>
                  {hour.toString().padStart(2, '0')}
                </Text>
              </View>
            ))}
            <View style={styles.pickerPadding} />
          </ScrollView>

          <ScrollView 
            style={styles.pickerColumn}
            showsVerticalScrollIndicator={false}
            snapToInterval={80}
            decelerationRate="fast"
            onScroll={handleMinuteScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.pickerPadding} />
            {minutes.map((minute) => (
              <View
                key={minute}
                style={[
                  styles.timeOption,
                  selectedMinute === minute && styles.selectedTimeOption
                ]}
              >
                <Text style={[
                  styles.timeOptionText,
                  selectedMinute === minute && styles.selectedTimeOptionText
                ]}>
                  {minute.toString().padStart(2, '0')}
                </Text>
              </View>
            ))}
            <View style={styles.pickerPadding} />
          </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  headerButton: {
    color: '#FF4444',
    fontSize: 17,
    fontFamily: 'DSEG7Classic-Regular',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
  },
  timeText: {
    fontSize: 48,
    color: '#FF4444',
    fontFamily: 'DSEG7Classic-Regular',
  },
  separator: {
    fontSize: 48,
    color: '#FF4444',
    marginHorizontal: 8,
    fontFamily: 'DSEG7Classic-Regular',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 400,
    position: 'relative',
  },
  selectionBar: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '70%',
    height: 80,
    transform: [{ translateX: -150 }, { translateY: -40 }],
    backgroundColor: '#2D1E1E',
    borderRadius: 8,
    zIndex: 1,
  },
  pickerColumn: {
    width: 120,
    height: '100%',
    zIndex: 2,
  },
  pickerPadding: {
    height: 160,
  },
  timeOption: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTimeOption: {
    backgroundColor: 'transparent',
  },
  timeOptionText: {
    fontSize: 24,
    color: '#FF4444',
    opacity: 0.3,
    fontFamily: 'DSEG7Classic-Regular',
  },
  selectedTimeOptionText: {
    fontSize: 32,
    opacity: 1,
    fontWeight: 'bold',
  },
}); 