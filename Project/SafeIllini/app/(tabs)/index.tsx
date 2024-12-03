/* eslint-disable import/no-unresolved */
import React, { useState, useEffect, useRef } from "react";
import { Text, View, Image, StyleSheet, TouchableOpacity, Linking, Alert, Platform, Button } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";
import { database } from "@/configs/firebaseConfig";
// import { database, messaging } from "@/configs/firebaseConfig";
import { ref, set, onValue } from 'firebase/database';
// import { getToken } from 'firebase/messaging';
import { router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Incident, IncidentType } from '@/types/incidents';
import { INCIDENT_TYPE_LABELS, PIN_COLORS } from '@/constants/Incidents';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
// using Incident interface instead of PinPosition interface since we're going grab all the incidents from the database
/**
* @typedef {Object} Incident
* @property {string} id - The unique identifier for the incident.
* @property {string} type - The type of the incident.
* @property {string} severity - The severity level of the incident.
* @property {string} description - A description of the incident.
* @property {Object} location - The location of the incident.
* @property {number} location.latitude - The latitude of the incident location.
* @property {number} location.longitude - The longitude of the incident location.
* @property {number} timestamp - The timestamp of when the incident occurred.
* @property {Object} [photos] - An object containing photos related to the incident.
**/
// interface Incident {
//   id: string;
//   type: string;
//   severity: string;
//   location: { latitude: number; longitude: number };
//   timestamp: number;
//   description?: string;
//   photos?: { [key: string]: string };
// }

// sample incident data for testing purposes
// const dummyIncidents: Incident[] = [
//   {
//     id: "1",
//     type: "sexual_harassment",
//     severity: "high",
//     location: {
//       latitude: 40.1020, // Main Quad
//       longitude: -88.2272
//     },
//     timestamp: Date.now(),
//     description: "Incident near Main Quad"
//   },
//   {
//     id: "2",
//     type: "drunk_driving",
//     severity: "moderate",
//     location: {
//       latitude: 40.1089, // Illini Union
//       longitude: -88.2272
//     },
//     timestamp: Date.now(),
//     description: "Incident near Union"
//   },
//   {
//     id: "3",
//     type: "theft",
//     severity: "low",
//     location: {
//       latitude: 40.1164, // Green Street
//       longitude: -88.2434
//     },
//     timestamp: Date.now(),
//     description: "Incident on Green Street"
//   },
//   {
//     id: "4",
//     type: "assault",
//     severity: "high",
//     location: {
//       latitude: 40.105487, // West of Campus
//       longitude: -88.2439389
//     },
//     timestamp: Date.now(),
//     description: "Incident slightly west of campus"
//   }
// ];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function sendPushNotification(expoPushToken: string) {
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

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}


export default function Home() {
  // notification system
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();


  // state management for incident type filter and incidents list
  // track the currently selected incident type filter
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>("all");
  // state to store all incidents from the database
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // what does useEffect hook do?
  // useEffect hook is used to run side effects, such as data fetching, subscriptions, or updating the DOM, after rendering a component.
  // It takes in two arguments: a function that performs the side effect and an array of dependencies.
  // useEffect(() => {
  //   // side effect code here
  // }, [dependencies]);
  // in our case, we want to fetch incidents from Firebase and listen for real-time updates when the component mounts
  // additionally, we 
  useEffect(() => {
    // creating reference to the incidents node in Firebase
    const incidentsRef = ref(database, 'incidents');
    // Setting up real-time listener that updates when data changes
    // onValue function returns a func that when called, stops listening for updates.
    // We just named it "unsubscribe" because it terminates the subscription to Firebase updates and Removes the listener
    const unsubscribe = onValue(incidentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) { // check if data is available
        const incidentsData: Incident[] = [];
        // convert Firebase snapshot to array of incidents
        snapshot.forEach((childSnapshot) => {
          incidentsData.push({
            id: childSnapshot.key, // extract the unique Firebase key as the incident ID
            ...childSnapshot.val() // spread operator to merge all other incident data
          });
        });
        setIncidents(incidentsData); // update the incidents state with the fetched data
        // console.log("Incidents data:", incidentsData);
      } else {
        console.log("No data available");
        setIncidents([]); // clear the incidents state if no data is available
      }
    });

    // Gets the push token and displays it in the UI, or in case of an error, displays the error message.
    registerForPushNotificationsAsync()
      .then(token => {
        console.log("Push token:", token);
        setExpoPushToken(token ?? '');
      })
      .catch((error: any) => setExpoPushToken(`${error}`));

    // Listeners for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    // cleanup function to remove listeners when component unmounts
    return () => {
      unsubscribe();
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    }
  }, []);

  const handleLongPress = (event: any) => {
    // const { locationX, locationY } = event.nativeEvent;
    const { latitude, longitude } = event.nativeEvent.coordinate;
    // https://docs.expo.dev/router/advanced/nesting-navigators/#navigate-to-a-screen-in-a-nested-navigator
    // since we're using expo router, we need to handle navigation differently
    // we don't define navigation types. instead, we can just use router.push() to send info from one screen to another
    // the params AKA data we pass will be avail in the AddIncident screen through useLocalSearchParams()
    router.push({
      pathname: "/AddIncident", // navigate to the AddIncident screen
      params: { // pass latitude and longitude to AddIncident screen
        latitude,
        longitude,
      }
    });
  };

  // initiate emergency call to campus police
  const callCampusPolice = () => {
    const campusPoliceNumber = "6308910198";
    Linking.openURL(`tel:${campusPoliceNumber}`)
      .catch((err) => {
        console.error("Failed to open dialer:", err);
        Alert.alert("Error", "Unable to initiate the call. Please try again.");
      });
  };
  // determine marker color based on incident type
  const getPinColor = (incidentType: IncidentType) => {
    return PIN_COLORS[incidentType] || 'black';
  };
  // const getPinColor = (incidentType: string) => {
  //   switch (incidentType) {
  //     case "sexual_harassment": return "red";
  //     case "drunk_driving": return "orange";
  //     case "theft": return "yellow";
  //     case "assault": return "blue";
  //     default: return "green";
  //   }
  // };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
        <Text>Your Expo push token: {expoPushToken}</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text>Title: {notification && notification.request.content.title} </Text>
          <Text>Body: {notification && notification.request.content.body}</Text>
          <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
        </View>
        <Button
          title="Press to Send Notification"
          onPress={async () => {
            await sendPushNotification(expoPushToken);
          }}
        />
      </View>
    </GestureHandlerRootView>
  );
}

// Styles for component layout and appearance
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up all available space
  },
  pickerContainer: {
    position: 'absolute', // Float above map
    top: 20,
    left: 0,
    right: 0,
    zIndex: 1, // Ensure picker appears above map
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
  },
  picker: {
    width: '100%',
  },
  map: {
    flex: 1, // Take up all container space
    width: '100%',
    height: '100%',
  },
  sosButton: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5, // Android shadow effect
    shadowColor: '#000',  // iOS shadow effect
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sosButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});



/**
 * code below is for the `Index` component which fetches and displays a list of incidents from our database
 * in a scrollable view.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *

 *
 * @function fetchIncidents
 * Fetches incidents from the Firebase Realtime Database and updates the state.
 *
 * @throws Will throw an error if the data fetching fails.
 *
 */

// defines the structure/type of an incident object so that typescript knows the structure of the object
// interface Incident {
//   id: string;
//   type: string;
//   severity: string;
//   location: { latitude: number; longitude: number };
//   timestamp: number;
//   description?: string;
//   photos?: { [key: string]: string };
// }

// export default function Index() {
//   const [incidents, setIncidents] = useState<Incident[]>([]); // defining incidents as an array of Incident objects
//   const db = ref(database);
//   const fetchIncidents = async () => {
//     try {
//       const snapshot = await get(child(db, 'incidents'));
//       if (snapshot.exists()) {
//         // we need to define the type of incidentsData as an array of objects with the above fields 
//         // bc typescript doesn't know the type of data in the array and we need to tell it
//         const incidentsData: Incident[] = []; 
//         snapshot.forEach((childSnapshot) => {
//           incidentsData.push({
//             id: childSnapshot.key,
//             ...childSnapshot.val()
//           });
//         });
//         setIncidents(incidentsData);
//       } else {
//         console.log("No data available");
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchIncidents();
//   }, []);

//   return (
//     <ScrollView contentContainerStyle={{
//       flex: 1,
//       justifyContent: "center",
//       alignItems: "center",
//       padding: 20
//     }}>
//       <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 20}}>Incidents:</Text>
//       {incidents.map((incident) => (
//         <View key={incident.id} style={
//           {marginBottom: 20, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5}}>
//           <Text>Type: {incident.type}</Text>
//           <Text>Severity: {incident.severity}</Text>
//           <Text>Description: {incident.description || 'No description'}</Text>
//           <Text>Latitude: {incident.location.latitude}</Text>
//           <Text>Longitude: {incident.location.longitude}</Text>
//           <Text>Timestamp: {new Date(incident.timestamp).toLocaleString()}</Text>
//           <Text>Photos: {incident.photos ? Object.keys(incident.photos).length : 'No photos'}</Text>
//         </View>
//       ))}
//       <Button title="Refresh Incidents" onPress={fetchIncidents} />
//     </ScrollView>
//   );
// }


// code for adding dummy data to firebase
// export default function Index() {
//   const addIncidents = () => {
//     const incidentsRef = ref(database, 'incidents');

//     // adding first incident
//     const newIncidentRef1 = push(incidentsRef);
//     if (newIncidentRef1.key) {
//       const photosRef = ref(database, `${newIncidentRef1.key}/photos`);
//       const photoKey1 = push(photosRef).key;
//       const photoKey2 = push(photosRef).key;

//       set(newIncidentRef1, {
//         location: {
//           latitude: 37.7749,
//           longitude: -122.4194
//         },
//         timestamp: Date.now(),
//         type: "sexual_harassment",
//         severity: "high",
//         description: "Incident occurred near the downtown area",
//         photos: {
//           [photoKey1 || 'photo1']: "https://firebasestorage.googleapis.com/example1.jpg",
//           [photoKey2 || 'photo2']: "https://firebasestorage.googleapis.com/example2.jpg"
//         }
//       });
//     }

//     // adding second incident
//     const newIncidentRef2 = push(incidentsRef);
//     set(newIncidentRef2, {
//       location: {
//         latitude: 40.7128,
//         longitude: -74.0060
//       },
//       timestamp: Date.now(),
//       type: "drunk_driving",
//       severity: "moderate",
//       description: null,
//       photos: null
//     });
//   };

//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Text>Hello!!</Text>
//       <Button title="Add Incidents" onPress={addIncidents} />
//     </View>
//   );
// }