import { Text, StyleSheet, View, Pressable, Button, Alert } from "react-native";
import { database, auth } from "../configs/firebaseConfig"
import { ref, set, onValue, get, child } from 'firebase/database';
import MapView from 'react-native-maps';
import { Platform } from "react-native";
import { Heatmap } from 'react-native-maps';
import React, {useState, useEffect, useRef, Component}  from "react";

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
  const mapRef=useRef(null);
  const pointTypes = ['low', 'medium', 'high']; 

  const [incidents, setIncidents] = useState<Incident[]>([]); // defining incidents as an array of Incident objects
  const [heatmapPoints, setHeatmapPoints] = useState<
    { latitude: number; longitude: number; weight: number; type: string }[]
  >([]);
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

    const campusCoords = {
      latitude: 40.103,
      longitude: -88.23,
      latitudeDelta: 0.042,
      longitudeDelta: 0.000000001,
    };

    const centerMap = () => {  
      mapRef.current.animateToRegion(campusCoords, 1000);
    };

  return (
    <View style={styles.container}>
      <MapView
      ref={mapRef}
      style={styles.map}
      //for the mapType, add a conditional thing where
      //if the OS is ios, then make mapType={mutedStandard} because it look less ugly
      //i need to learn UI design
      mapType={"standard"}
      userInterfaceStyle={'dark'}
      showsUserLocation={true}
      userLocationPriority={'high'}
      loadingEnabled={true}
      loadingIndicatorColor={'#e66220'}
      loadingBackgroundColor={'#091547'}
      initialRegion={campusCoords}
    >
      {heatmapPoints.length > 0 && pointTypes.map((type) => (
          <Heatmap
            key = {type}
            points={heatmapPoints.filter(point => point.type === type)}
            radius={50}
            opacity={0.6}
            gradient={{
              colors:["black", "darkred", "yellow", "white"],
              startPoints: Platform.OS === 'ios' ? [0.05, 0.11, 0.25, 0.45]: 
              [0.1, 0.22, 0.5, 0.8],
              colorMapSize: 256,
            }}
          />
        ))}
      </MapView>
      <Pressable 
        style={styles.centerButton} 
        onPress={() => centerMap()}
        >
        <Text style={styles.buttonText}>Re-Center To Whole Campus</Text>
      </Pressable>
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
  centerButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#e66220',
    paddingVertical: 10,
    paddingHorizontal: 17,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});