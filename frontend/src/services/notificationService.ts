import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Visit, AppSettings } from '../types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false; // Web notifications not supported in this implementation
  }

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  // Configure Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('visa-alerts', {
      name: 'Visa Expiration Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#007AFF',
    });
  }

  return true;
}

// Schedule visa expiration notifications
export async function scheduleVisaNotifications(
  visits: Visit[],
  settings: AppSettings
): Promise<void> {
  if (!settings.visaAlertsEnabled) {
    await cancelAllNotifications();
    return;
  }

  // Cancel existing notifications first
  await cancelAllNotifications();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all alert days (preset + custom)
  const alertDays = [...settings.visaAlertDays];
  if (settings.customAlertDays && settings.customAlertDays > 0) {
    alertDays.push(settings.customAlertDays);
  }
  const uniqueAlertDays = [...new Set(alertDays)].sort((a, b) => b - a);

  for (const visit of visits) {
    if (!visit.exitDate) continue; // Skip visits without exit date

    const exitDate = new Date(visit.exitDate);
    exitDate.setHours(0, 0, 0, 0);

    // Skip past visits
    if (exitDate < today) continue;

    for (const daysBeforeExpiry of uniqueAlertDays) {
      const notificationDate = new Date(exitDate);
      notificationDate.setDate(notificationDate.getDate() - daysBeforeExpiry);
      notificationDate.setHours(9, 0, 0, 0); // Notify at 9 AM

      // Skip if notification date is in the past
      if (notificationDate <= today) continue;

      // Schedule based on frequency
      if (settings.alertFrequency === 'once') {
        await scheduleOneTimeNotification(visit, daysBeforeExpiry, notificationDate);
      } else if (settings.alertFrequency === 'daily') {
        await scheduleDailyNotifications(visit, daysBeforeExpiry, notificationDate, exitDate);
      } else if (settings.alertFrequency === 'weekly') {
        await scheduleWeeklyNotifications(visit, daysBeforeExpiry, notificationDate, exitDate);
      }
    }
  }
}

async function scheduleOneTimeNotification(
  visit: Visit,
  daysBeforeExpiry: number,
  notificationDate: Date
): Promise<void> {
  const identifier = `visa-${visit.id}-${daysBeforeExpiry}`;
  
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: '⚠️ Visa Expiration Alert',
      body: `Your ${visit.visaType} visa for ${visit.countryName} expires in ${daysBeforeExpiry} days!`,
      data: { visitId: visit.id, type: 'visa-expiration' },
      sound: true,
    },
    trigger: {
      type: 'date',
      date: notificationDate,
    } as Notifications.NotificationTriggerInput,
  });
}

async function scheduleDailyNotifications(
  visit: Visit,
  daysBeforeExpiry: number,
  startDate: Date,
  exitDate: Date
): Promise<void> {
  const currentDate = new Date(startDate);
  let dayCount = 0;
  const maxNotifications = 30; // Limit to prevent too many notifications

  while (currentDate < exitDate && dayCount < maxNotifications) {
    const daysRemaining = Math.ceil((exitDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    const identifier = `visa-daily-${visit.id}-${currentDate.toISOString()}`;

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: '📅 Visa Reminder',
        body: `${daysRemaining} days remaining on your ${visit.visaType} visa for ${visit.countryName}`,
        data: { visitId: visit.id, type: 'visa-reminder' },
        sound: dayCount === 0, // Only sound on first notification
      },
      trigger: {
        type: 'date',
        date: currentDate,
      } as Notifications.NotificationTriggerInput,
    });

    currentDate.setDate(currentDate.getDate() + 1);
    dayCount++;
  }
}

async function scheduleWeeklyNotifications(
  visit: Visit,
  daysBeforeExpiry: number,
  startDate: Date,
  exitDate: Date
): Promise<void> {
  const currentDate = new Date(startDate);
  let weekCount = 0;
  const maxNotifications = 12; // ~3 months of weekly notifications

  while (currentDate < exitDate && weekCount < maxNotifications) {
    const daysRemaining = Math.ceil((exitDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    const identifier = `visa-weekly-${visit.id}-${currentDate.toISOString()}`;

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: '📆 Weekly Visa Update',
        body: `${daysRemaining} days remaining on your ${visit.visaType} visa for ${visit.countryName}`,
        data: { visitId: visit.id, type: 'visa-weekly' },
        sound: true,
      },
      trigger: {
        type: 'date',
        date: currentDate,
      } as Notifications.NotificationTriggerInput,
    });

    currentDate.setDate(currentDate.getDate() + 7);
    weekCount++;
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// Listen for notification interactions
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Listen for notifications received while app is foregrounded
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}
