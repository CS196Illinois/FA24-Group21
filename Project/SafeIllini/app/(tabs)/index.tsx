import React, { useState, useEffect } from "react";
import { Text, View, Image, StyleSheet, TouchableOpacity, Linking, Alert, TouchableWithoutFeedback } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { database } from "../../configs/firebaseConfig"
import { ref, set, onValue } from 'firebase/database';
import { router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';

// using Incident interface instead of PinPosition interface since we're going grab all the incidents from the database
interface Incident {
  id: string;
  type: string;
  severity: string;
  location: { latitude: number; longitude: number };
  timestamp: number;
  description?: string;
  photos?: { [key: string]: string };
}

const dummyIncidents: Incident[] = [
  {
    id: "1",
    type: "sexual_harassment",
    severity: "high",
    location: {
      latitude: 40.1020, // Main Quad
      longitude: -88.2272
    },
    timestamp: Date.now(),
    description: "Incident near Main Quad"
  },
  {
    id: "2",
    type: "drunk_driving",
    severity: "moderate",
    location: {
      latitude: 40.1089, // Illini Union
      longitude: -88.2272
    },
    timestamp: Date.now(),
    description: "Incident near Union"
  },
  {
    id: "3",
    type: "theft",
    severity: "low",
    location: {
      latitude: 40.1164, // Green Street
      longitude: -88.2434
    },
    timestamp: Date.now(),
    description: "Incident on Green Street"
  }
];

export default function Home() {
  const [selectedIncidentType, setSelectedIncidentType] = useState("all");
  // const [incidents, setIncidents] = useState<Incident[]>([]);
  
  // useEffect(() => {
  //   const incidentsRef = ref(database, 'incidents');
  //   // onValue function returns a func that when called, stops listening for updates.
  //   // We call it "unsubscribe" because it:
  //   // Terminates the subscription to Firebase updates and Removes the listener
  //   const unsubscribe = onValue(incidentsRef, (snapshot) => {  
  //     const data = snapshot.val();
  //     if (data) {
  //       const incidentsData = Object.entries(data).map(([key, value]: [string, any]) => ({
  //         id: key,
  //         type: value.type,
  //         severity: value.severity,
  //         location: value.location,
  //         timestamp: value.timestamp,
  //         description: value.description,
  //         photos: value.photos
  //       }));
  //       setIncidents(incidentsData);
  //       console.log("Incidents data:", incidentsData);
  //     } else {
  //       console.log("No data available");
  //       setIncidents([]);
  //     }
  //   });

  //   return () => unsubscribe()
  // }, []);

  const handleLongPress = (event: any) => {
    // const { locationX, locationY } = event.nativeEvent;
    const { latitude, longitude } = event.nativeEvent.coordinate;
    // https://docs.expo.dev/router/advanced/nesting-navigators/#navigate-to-a-screen-in-a-nested-navigator
    // since we're using expo router, we need to handle navigation differently
    // we dont' define navigation types. instead, we can just use router.push() to send info from one screen to another
    // the params AKA data we pass will be avail in the AddIncident screen through useLocalSearchParams()
    router.push({
      pathname: "/AddIncident",
      params: {
        latitude,
        longitude,
      }
    });
  };

  const callCampusPolice = () => {
    const campusPoliceNumber = "6308910198";
    Linking.openURL(`tel:${campusPoliceNumber}`)
      .catch((err) => {
        console.error("Failed to open dialer:", err);
        Alert.alert("Error", "Unable to initiate the call. Please try again.");
      });
  };

  const getPinColor = (incidentType: string) => {
    switch (incidentType) {
      case "sexual_harassment": return "red";
      case "drunk_driving": return "orange";
      case "theft": return "yellow";
      case "assault": return "blue";
      default: return "green";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedIncidentType}
          onValueChange={(itemValue) => setSelectedIncidentType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All Incidents" value="all" />
          <Picker.Item label="Sexual Harassment" value="sexual_harassment" />
          <Picker.Item label="Drunk Driving" value="drunk_driving" />
          <Picker.Item label="Theft" value="theft" />
          <Picker.Item label="Assault" value="assault" />
        </Picker>
      </View>
      <MapView
        style={styles.map}
        provider="google"
        mapType="satellite"
        initialRegion={{
          latitude: 40.1020,
          longitude: -88.2272,
          latitudeDelta: 0.0222,
          longitudeDelta: 0.0121,
        }}
        onMapReady={() => {
          console.log('Map ready');
				}}
        onLongPress={handleLongPress}
      >
        {dummyIncidents
          .filter(incident => selectedIncidentType === "all" || incident.type === selectedIncidentType)
          .map((incident) => (
            <Marker
              key={incident.id}
              coordinate={{
                latitude: incident.location.latitude,
                longitude: incident.location.longitude,
              }}
              title="Test Marker"
              description="This is a test marker"
              pinColor="red"
              // pinColor={getPinColor(incident.type)}
              // title={`${incident.type.replace('_', ' ').toUpperCase()} - ${incident.severity}`}
              // description={incident.description || `Reported at ${new Date(incident.timestamp).toLocaleString()}`}
            />
          )
          )
        }
      </MapView>
      {/* <MapView
        style={styles.map}
        provider="google"
        mapType="satellite"
        initialRegion={{
          latitude: 40.1020,
          longitude: -88.2272,
          latitudeDelta: 0.0222,
          longitudeDelta: 0.0121,
          }}
        onMapReady={() => {
          console.log('Map ready');
        }}
        onLongPress={handleLongPress}
      >
        {dummyIncidents
          .filter(incident => selectedIncidentType === "all" || incident.type === selectedIncidentType)
          .map((incident) => (
            <Marker
              key={incident.id}
              coordinate={{
                latitude: 40.1020,
                longitude: -88.2272,
              }}
              title="Test Marker"
              description="This is a test marker"
              pinColor="red"
              // pinColor={getPinColor(incident.type)}
              // title={`${incident.type.replace('_', ' ').toUpperCase()} - ${incident.severity}`}
              // description={incident.description || `Reported at ${new Date(incident.timestamp).toLocaleString()}`}
            />
          ))}
      </MapView> */}

      <TouchableOpacity style={styles.sosButton} onPress={callCampusPolice}>
        <Text style={styles.sosButtonText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pickerContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
  },
  picker: {
    width: '100%',
  },
  map: {
    flex: 1,
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
    elevation: 5,
    shadowColor: '#000',
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