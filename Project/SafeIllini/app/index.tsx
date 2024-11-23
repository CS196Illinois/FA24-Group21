import { Text, StyleSheet, View } from "react-native";
import { database, auth } from "../configs/firebaseConfig"
import { ref, set, onValue, get, child } from 'firebase/database';
import MapView from 'react-native-maps';
import { Platform } from "react-native";
import { Heatmap } from 'react-native-maps';
import { red } from "react-native-reanimated/lib/typescript/reanimated2/Colors";
import React, {useState, useEffect}  from "react";

const getPointWeight = (type: any) => {
  switch (type) {
    case 'low':
      return 0.65;
    case 'medium':
      return 0.8;
    case 'high':
      return 1;
    default:
      return 0.6;
  }
};


interface Incident {
  id: string;
  type: string;
  severity: string;
  location: { latitude: number; longitude: number };
  timestamp: number;
  description?: string;
  photos?: { [key: string]: string };
}
const db = ref(database);

export default function Index() {
  const pointTypes = ['low', 'medium', 'high']; 

  const [incidents, setIncidents] = useState<Incident[]>([]); // defining incidents as an array of Incident objects
  const [heatmapPoints, setHeatmapPoints] = useState<
    { latitude: number; longitude: number; weight: number; type: string }[]
  >([]);
  // I think the problem with the code is here because maybe "database" is not a valid thing :/ ?
  const fetchIncidents = async () => {
    try {
      const snapshot = await get(child(db, 'incidents'));
      if (snapshot.exists()) {
        // we need to define the type of incidentsData as an array of objects with the above fields 
        // bc typescript doesn't know the type of data in the array and we need to tell it
        const incidentsData: Incident[] = []; 
        snapshot.forEach((childSnapshot) => {
          incidentsData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        setIncidents(incidentsData);
        console.log(incidentsData);
        const points = incidentsData.map((incident) => ({
          latitude: incident.location.latitude,
          longitude: incident.location.longitude,
          weight: getPointWeight(incident.type),
          type: incident.severity
        }));
        setHeatmapPoints(points);
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
      style={styles.map}
      mapType={"standard"}
      userInterfaceStyle={'dark'}
      showsUserLocation={true}
      userLocationPriority={'high'}
      initialRegion={{
        latitude: 40.103,
        longitude: -88.23,
        latitudeDelta: 0.042,
        longitudeDelta: 0.000000001,
      }}
    >
      {heatmapPoints.length > 0 && pointTypes.map((type) => (
          <Heatmap
            key = {type}
            points={heatmapPoints.filter(point => point.type === type)}
            radius={50}
            opacity={0.58}
            gradient={{
              colors:["navy", "blue", "green", "yellow", "red"],
              startPoints: Platform.OS === 'ios' ? [0.07, 0.15, 0.25, 0.35, 0.5]: 
              [0.1, 0.2, 0.3, 0.4, 0.5],
              colorMapSize: 256,
            }}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '110%',
  },
});