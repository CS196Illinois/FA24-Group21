/* eslint-disable import/no-unresolved */
import React, { useState, useEffect } from "react";
import { Text, View, Image, StyleSheet, TouchableOpacity, Linking, Alert, TouchableWithoutFeedback } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { database } from "../../configs/firebaseConfig"
import { ref, set, onValue } from 'firebase/database';
import { router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Incident, IncidentType } from '@/types/incidents';
import { INCIDENT_TYPE_LABELS, PIN_COLORS } from '@/constants/Incidents';
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



export default function Home() {
  // state management for incident type filter and incidents list
  // track the currently selected incident type filter
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>("all");
  // state to store all incidents from the database
  const [incidents, setIncidents] = useState<Incident[]>([]);
  // effect hook to fetch and listen for real-time updates from Firebase
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
    // cleanup function to remove listener when component unmounts
    return () => unsubscribe()
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
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedIncidentType}
          onValueChange={(itemValue) => setSelectedIncidentType(itemValue)}
          style={styles.picker}
        >
          {/* Picker options for different incident types */}
          <Picker.Item label="All Incidents" value="all" />
          {INCIDENT_TYPE_LABELS.map(({ label, value }) => (
            <Picker.Item key={value} label={label} value={value} />
          ))}
        </Picker>
      </View>
      {/* Map component showing campus area. For more options, go to https://github.com/react-native-maps/react-native-maps/blob/master/docs/mapview.md */}
      <MapView
        style={styles.map}
        provider="google"
        mapType="satellite"
        initialRegion={{
          latitude: 40.1020,
          longitude: -88.2272,
          latitudeDelta: 0.0222, // Zoom Level for the map
          longitudeDelta: 0.0121,
        }}
        onMapReady={() => {
          console.log('Map ready');
        }}
        onLongPress={handleLongPress}
      >
        {/* Filter and display incident markers on map */}
        {incidents
          // Filter the incidents array based on selected type
          // First part of the OR condition: Show all incidents if "all" is selected 
          // Second part of the OR condition: Only show the ones matching the selected type
          .filter(incident => selectedIncidentType === "all" || incident.type === selectedIncidentType)
          // Map through the filtered incidents array and create a Marker component for each incident
          // For more options, go to https://github.com/react-native-maps/react-native-maps/blob/master/docs/marker.md
          .map((incident) => (
            <Marker
              key={incident.id} // React requires unique key for list item
              coordinate={{ // // Set marker position on map
                latitude: incident.location.latitude,
                longitude: incident.location.longitude,
              }}
              pinColor={getPinColor(incident.type)} // Set pin color based on incident type
              title={`${incident.type.replace('_', ' ').toUpperCase()} - ${incident.severity}`}
              // Show description if available or show timestamp
              description={incident.description || `Reported at ${new Date(incident.timestamp).toLocaleString()}`}
            // pinColor="red"
            // title="Test Marker"
            // description="This is a test marker"
            />
          )
          )
        }
      </MapView>

      <TouchableOpacity style={styles.sosButton} onPress={callCampusPolice}>
        <Text style={styles.sosButtonText}>SOS</Text>
      </TouchableOpacity>
    </View>
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