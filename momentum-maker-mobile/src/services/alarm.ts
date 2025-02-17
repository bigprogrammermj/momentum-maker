import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { sendFailureEmail } from './email';
import { soundService } from './sound';
import { navigate } from './navigation';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let notificationSubscription: any = null;
let quizStartTimer: NodeJS.Timeout | null = null;

export async function scheduleAlarm(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date(now);
  
  scheduledTime.setHours(hours);
  scheduledTime.setMinutes(minutes);
  scheduledTime.setSeconds(0);
  scheduledTime.setMilliseconds(0);

  if (scheduledTime < now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return false;
  }

  if (notificationSubscription) {
    notificationSubscription.remove();
  }

  notificationSubscription = Notifications.addNotificationReceivedListener(async () => {
    console.log('Alarm time reached, starting sound sequence...');
    await soundService.playAlarm();
    
    if (quizStartTimer) {
      clearTimeout(quizStartTimer);
    }
    
    requestAnimationFrame(() => {
      navigate('Quiz');
    });
    
    quizStartTimer = setTimeout(async () => {
      await sendFailureEmail();
    }, 60000);
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Wake Up!',
      body: 'Time to solve the quiz and start your day!',
      sound: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: 'calendar',
      hour: hours,
      minute: minutes,
      repeats: true,
    } as Notifications.NotificationTriggerInput,
  });

  setTimeout(() => {
    const nextDay = new Date(scheduledTime);
    nextDay.setDate(nextDay.getDate() + 1);
    scheduleAlarm(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
  }, scheduledTime.getTime() - Date.now() + 1000);

  return true;
}

export async function cancelAlarm() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (notificationSubscription) {
    notificationSubscription.remove();
  }
  if (quizStartTimer) {
    clearTimeout(quizStartTimer);
    quizStartTimer = null;
  }
}

export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarm', {
      name: 'Alarm',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#98FB98',
    });
  }
}

export function clearQuizStartTimer() {
  if (quizStartTimer) {
    clearTimeout(quizStartTimer);
    quizStartTimer = null;
  }
} 