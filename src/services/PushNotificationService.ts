import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import Toast from 'react-native-toast-message';

export const requestUserPermission = async () => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  } else if (Platform.OS === 'android') {
    // In Android 13+, permissions should be requested. react-native-firebase handles this if properly configured in manifest.
    try {
      await messaging().requestPermission();
    } catch (e) {
      console.log('Error requesting Android permission', e);
    }
  }
};

export const getFCMToken = async () => {
  try {
    if (Platform.OS === 'ios' && !messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.log('Error getting FCM token', error);
  }
};

export const setupPushNotifications = () => {
  // Request permission on mount
  requestUserPermission().then(() => {
    // Call getFCMToken to log it to the console
    getFCMToken();
  });

  // Foreground message handler
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived in the foreground!', remoteMessage);
    
    Toast.show({
      type: 'info',
      text1: remoteMessage.notification?.title || 'New Notification',
      text2: remoteMessage.notification?.body || 'You have a new message.',
      position: 'top',
      visibilityTime: 4000,
    });
  });

  // Handle notification tap when app is in background
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification caused app to open from background state:', remoteMessage.notification);
    // TODO: Navigation logic here
  });

  // Handle notification tap when app was completely killed
  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
      console.log('Notification caused app to open from quit state:', remoteMessage.notification);
      // TODO: Navigation logic here
    }
  });

  return unsubscribe;
};
