import React, { useEffect, useState } from "react";
import { Text, View, Button, ScrollView } from "react-native";
import { database, auth } from "../configs/firebaseConfig"
import { ref, getDatabase, push, set, onValue, child, get } from 'firebase/database';


export default function Index() {
    return (
        <View
          style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hello!!</Text>
    </View>
  );
}



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