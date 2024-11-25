import { Text, StyleSheet, View, Pressable} from "react-native";
import { database, auth } from "../configs/firebaseConfig"
import { ref, get, child } from 'firebase/database';
import { Picker } from '@react-native-picker/picker';
import MapView from 'react-native-maps';
import { Platform } from "react-native";
import { Heatmap } from 'react-native-maps';

import React, {useState, useEffect, useRef}  from "react";

//this is used to set the "weight" of each heatmap point depending on its severity (low, medium, high)
//low severity is smallest, high severity is highest
const getPointWeight = (severity: any) => {
  switch (severity) {
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

//this is the interface of the things each indicident from the firebase database will return when we request
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

  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    {label: 'All Incidents', value: 'all'},
    {label: 'Low Severity', value: 'low'},
    {label: 'Medium Severity', value: 'medium'},
    {label: 'High Severity', value: 'high'}
  ]);

  const [incidents, setIncidents] = useState<Incident[]>([]); // defining incidents as an array of Incident objects
  const [heatmapPoints, setHeatmapPoints] = useState<
    { latitude: number; longitude: number; weight: number; type: string }[]
  >([]);

  const fetchIncidents = async () => {
    try {
      const snapshot = await get(child(db, 'incidents'));
      if (snapshot.exists()) {
        let incidentsData: Incident[] = [];
        snapshot.forEach((childSnapshot) => {
          incidentsData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        
        // Filter incidents based on selected severity
        if (selectedSeverity !== 'all') {
          incidentsData = incidentsData.filter(incident => incident.severity === selectedSeverity);
        }
        
        setIncidents(incidentsData);
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
  }, [selectedSeverity]);

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
      <View style={styles.dropdownContainer}>
      <Picker
          selectedValue={selectedSeverity}
          onValueChange={(itemValue) => setSelectedSeverity(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All Incidents" value="all" />
          <Picker.Item label="Low Severity" value="low" />
          <Picker.Item label="Medium Severity" value="medium" />
          <Picker.Item label="High Severity" value="high" />
        </Picker>
      </View>
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
      <Pressable style={styles.centerButton} onPress={() => centerMap()}>
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
    zIndex: 1,
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
    zIndex: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 40,
    left: 40,
    right: 40,
    zIndex: 2,
    backgroundColor: 'white', // Add a solid background color
    borderRadius: 8, // Add rounded corners
    elevation: 14, // Add elevation for Android shadow
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: 'white', // Ensure the picker itself has a background
  },
});