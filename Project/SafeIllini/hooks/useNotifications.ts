import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import NotificationService from '@/services/NotificationService';

// Code mostly from https://docs.expo.dev/push-notifications/push-notifications-setup/

export const useNotifications = () => {
    // setup the notification handler to handle notifications
    // shouldShowAlert: true will display a notification alert on the device
    // shouldPlaySound: true will play a sound when the notification is received
    // shouldSetBadge: false will not update the app's badge with the number of new notifications
    // see: https://docs.expo.io/versions/latest/sdk/notifications/#notificationhandler-object
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });

    // notification system
    const [expoPushToken, setExpoPushToken] = useState<string>('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(
        undefined
    );
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    useEffect(() => {
        // Gets the push token and displays it in the UI, or in case of an error, displays the error message.
        NotificationService.registerForPushNotificationsAsync()
            .then(token => {
                console.log("Push token:", token);
                setExpoPushToken(token ?? '');
            })
            .catch((error: any) => setExpoPushToken(`${error}`));
        // setting up notification listeners
        setupNotificationListeners();

        return () => {
            cleanup();
        };
    }, []);

    // Listeners for notifications
    const setupNotificationListeners = () => {
        // This listener is fired whenever a notification is received while the app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener(
            notification => setNotification(notification)
        );
        // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            response => console.log(response)
        );
    };

    const cleanup = () => {
        notificationListener.current &&
            Notifications.removeNotificationSubscription(notificationListener.current);
        responseListener.current &&
            Notifications.removeNotificationSubscription(responseListener.current);
    };

    return {
        expoPushToken,
        notification,
        sendPushNotification: NotificationService.sendPushNotification
    };
};