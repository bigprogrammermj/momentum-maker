import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const API_URL = 'http://172.20.10.3:3000/api';

interface EmailConfig {
  enabled: boolean;
  recipient: string;
  customMessage: string;
  customSubject: string;
}

export async function loadEmailConfig(): Promise<EmailConfig | null> {
  try {
    const emailEnabled = await AsyncStorage.getItem('emailEnabled');
    const emailRecipient = await AsyncStorage.getItem('emailAddress');
    const customMessage = await AsyncStorage.getItem('emailCustomMessage');
    const customSubject = await AsyncStorage.getItem('emailCustomSubject');

    if (!emailEnabled || !emailRecipient) {
      return null;
    }

    return {
      enabled: emailEnabled === 'true',
      recipient: emailRecipient,
      customMessage: customMessage || 'Ich bin zu faul zum Aufstehen und muss jetzt die Konsequenzen tragen!',
      customSubject: customSubject || 'Momentum Maker - Wecker-Versagen!',
    };
  } catch (error) {
    console.error('Error loading email config:', error);
    return null;
  }
}

export async function saveEmailConfig(config: EmailConfig): Promise<boolean> {
  try {
    await AsyncStorage.setItem('emailEnabled', config.enabled.toString());
    await AsyncStorage.setItem('emailAddress', config.recipient);
    await AsyncStorage.setItem('emailCustomMessage', config.customMessage);
    await AsyncStorage.setItem('emailCustomSubject', config.customSubject);
    return true;
  } catch (error) {
    console.error('Error saving email config:', error);
    return false;
  }
}

export async function sendFailureEmail(): Promise<boolean> {
  try {
    console.log('Versuche E-Mail zu senden...');
    const config = await loadEmailConfig();
    if (!config || !config.enabled || !config.recipient) {
      console.log('E-Mail-Versand übersprungen: Konfiguration deaktiviert oder unvollständig');
      return false;
    }

    console.log('Sende E-Mail an:', config.recipient);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_URL}/send-failure-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: config.recipient,
        customMessage: config.customMessage,
        customSubject: config.customSubject
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('E-Mail-Versand fehlgeschlagen:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      console.error('E-Mail-Server-Fehler:', data.error);
      throw new Error(data.error || 'Failed to send email');
    }

    console.log('E-Mail erfolgreich versendet');
    return true;
  } catch (error) {
    console.error('Fehler beim E-Mail-Versand:', error);
    return false;
  }
}

export async function testBackendConnection(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Versuche Backend-Verbindung zu:', API_URL);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_URL}/health-check`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Backend-Antwort Status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend-Antwort Daten:', data);
    return {
      success: true,
      message: data.message || 'Backend connection successful',
    };
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Backend connection failed',
    };
  }
} 