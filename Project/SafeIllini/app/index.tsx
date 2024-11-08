import { Text, StyleSheet, View } from "react-native";
import { database, auth } from "../configs/firebaseConfig"
import { ref, set, onValue, get } from 'firebase/database';
import MapView from 'react-native-maps';
import { Platform } from "react-native";
import { Heatmap } from 'react-native-maps';
import { red } from "react-native-reanimated/lib/typescript/reanimated2/Colors";
import React, {useState, useEffect}  from "react";

const getPointColor = (type) => {
  switch (type) {
    case 'low':
      return '#930808';
    case 'medium':
      return '#c80a0a';
    case 'high':
      return '#ff0000';
    default:
      return 'green';
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

export default function Index() {
  // const heatmapPoints = [
  //   { latitude: 40.107, longitude: -88.23, weight: 1, type: 'high' }, 
  //   { latitude: 40.103, longitude: -88.23, weight: 1, type: 'low' },
  //   { latitude: 40.105, longitude: -88.23, weight: 1, type: 'medium' }
  // ];

  const pointTypes = ['low', 'medium', 'high']; 

  const [incidents, setIncidents] = useState<Incident[]>([]); // defining incidents as an array of Incident objects
  const [heatmapPoints, setHeatmapPoints] = useState<
    { latitude: number; longitude: number; weight: number; type: string }[]
  >([]);
  const db = ref(database);
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

  useEffect(() => {
    // Transform incidents into heatmapPoints
    const points = incidents.map((incident) => ({
      latitude: incident.location.latitude,
      longitude: incident.location.longitude,
      weight: 1, // or any logic to determine weight
      type: incident.severity
    }));
    setHeatmapPoints(points);
  }, [incidents]);

  return (
    <View style={styles.container}>
      <MapView
      style={styles.map}
      initialRegion={{
        latitude: 40.103,
        longitude: -88.23,
        latitudeDelta: 0.042,
        longitudeDelta: 0.000000001,
      }}
    >
      {pointTypes.map((type) => (
          <Heatmap
            key = {type}
            points={heatmapPoints.filter(point => point.type === type)}
            radius={10}
            opacity={1}
            gradient={{
              colors: [getPointColor(type)],
              startPoints: [0.75],
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