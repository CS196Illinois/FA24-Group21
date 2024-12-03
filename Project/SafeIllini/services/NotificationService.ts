import { Platform } from "react-native";
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

// Code mostly from https://docs.expo.dev/push-notifications/push-notifications-setup/

// Function to handle registration errors
function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

class NotificationService {
  // Register for push notifications according to documentation
  async registerForPushNotificationsAsync() {
    // Android requires extra permissions on the manifest. This function sets up the channel for Android
    if (Platform.OS === 'android') {
      await this.setAndroidChannel();
    }
    // Physical device is required for push notifications to work
    if (!Device.isDevice) {
      handleRegistrationError('Must use physical device for push notifications');
    }

    // Request permissions to get the push token
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    // If permissions are not granted, request permissions
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    // projectID necessary for getExpoPushTokenAsync to work correctly
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }

    try {
      // getExpoPushTokenAsync fetches the push token from the Expo servers
      // This token is necessary for sending notifications to the device
      const pushTokenString = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  }

  private async setAndroidChannel() {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // temporary function to send a push notification using the Expo API
  async sendPushNotification(expoPushToken: string) {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'Original Title',
      body: 'And here is the body!',
      data: { someData: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Accept-encoding': 'gzip, deflate',
      },
      body: JSON.stringify(message),
    });
  }
};

export default new NotificationService();