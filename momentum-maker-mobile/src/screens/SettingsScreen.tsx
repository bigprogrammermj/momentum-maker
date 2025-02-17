import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Animated, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { loadEmailConfig, saveEmailConfig } from '../services/email';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

export function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (emailEnabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [emailEnabled]);

  const loadSettings = async () => {
    const config = await loadEmailConfig();
    if (config) {
      setEmailEnabled(config.enabled);
      setEmailAddress(config.recipient);
      setCustomMessage(config.customMessage);
      setCustomSubject(config.customSubject);
    }
  };

  const handleToggle = async (value: boolean) => {
    setEmailEnabled(value);
    await saveEmailConfig({
      enabled: value,
      recipient: emailAddress,
      customMessage: customMessage || 'Ich bin zu faul zum Aufstehen und muss jetzt die Konsequenzen tragen!',
      customSubject: customSubject || 'Momentum Maker - Wecker-Versagen!'
    });
  };

  const handleEmailChange = async (value: string) => {
    setEmailAddress(value);
    await saveEmailConfig({
      enabled: emailEnabled,
      recipient: value,
      customMessage,
      customSubject
    });
  };

  const handleSubjectChange = async (value: string) => {
    setCustomSubject(value);
    await saveEmailConfig({
      enabled: emailEnabled,
      recipient: emailAddress,
      customMessage,
      customSubject: value
    });
  };

  const handleMessageChange = async (value: string) => {
    setCustomMessage(value);
    await saveEmailConfig({
      enabled: emailEnabled,
      recipient: emailAddress,
      customMessage: value,
      customSubject
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <ScrollView 
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
            >
              {emailEnabled && (
                <Animated.Text style={[
                  styles.warningText,
                  {
                    opacity: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  }
                ]}>
                  WARNUNG: DIE E-MAIL WIRD RAUSGEHEN{'\n'}
                  WENN DU DEN WECKER NICHT ENTSCHÄRFST!{'\n'}
                  IF YOU SNOOZE, YOU LOSE!
                </Animated.Text>
              )}

              <View style={styles.formContainer}>
                <View style={styles.statusRow}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.toggleContainer}>
                    <Text style={[styles.statusText, { color: emailEnabled ? '#FF4444' : '#666' }]}>
                      {emailEnabled ? 'ARMED' : 'UNARMED'}
                    </Text>
                    <TouchableOpacity 
                      style={styles.toggle}
                      onPress={() => handleToggle(!emailEnabled)}
                    >
                      <View style={[
                        styles.toggleButton,
                        { transform: [{ translateX: emailEnabled ? 30 : 0 }] },
                        { backgroundColor: emailEnabled ? '#FF4444' : '#2D1E1E' },
                        styles.toggleButtonShadow
                      ]} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.label}>Empfänger</Text>
                <TextInput
                  style={styles.input}
                  value={emailAddress}
                  onChangeText={handleEmailChange}
                  placeholder="E-Mail-Adresse eingeben"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Betreff</Text>
                <TextInput
                  style={styles.input}
                  value={customSubject}
                  onChangeText={handleSubjectChange}
                  placeholder="E-Mail-Betreff eingeben"
                  placeholderTextColor="#666"
                />

                <Text style={styles.label}>Bestrafungs-Nachricht</Text>
                <TextInput
                  style={[styles.input, styles.messageInput]}
                  value={customMessage}
                  onChangeText={handleMessageChange}
                  placeholder="Nachricht eingeben"
                  placeholderTextColor="#666"
                  multiline
                />
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 32,
  },
  content: {
    flex: 1,
    marginTop: 64,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  warningText: {
    fontSize: 16,
    color: '#FF4444',
    marginBottom: 32,
    fontFamily: 'DSEG7Classic-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
    gap: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    position: 'absolute',
    top: 32,
    left: 32,
    zIndex: 1,
  },
  backButtonText: {
    color: '#FF4444',
    fontSize: 32,
    fontFamily: 'DSEG7Classic-Regular',
  },
  label: {
    fontSize: 16,
    color: '#FF4444',
    fontFamily: 'DSEG7Classic-Regular',
  },
  input: {
    backgroundColor: '#2D1E1E',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'DSEG7Classic-Regular',
  },
  toggle: {
    width: 80,
    height: 40,
    backgroundColor: '#2D1E1E',
    borderRadius: 20,
    justifyContent: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF4444',
  },
  toggleButtonShadow: {
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
}); 