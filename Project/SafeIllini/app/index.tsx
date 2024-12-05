import { Text, StyleSheet, View, Pressable, Button } from "react-native";
import { database } from "../configs/firebaseConfig"
import { ref, get, child } from 'firebase/database';
import { Picker } from '@react-native-picker/picker';
import MapView from 'react-native-maps';
import { Platform } from "react-native";
import { Heatmap } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';

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
      return 0.5;
  }
};

const formatLastUpdated = (timestamp: any) => {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  return date.toLocaleString(); // Format as "MM/DD/YYYY, HH:MM:SS AM/PM"
};

//this is the interface of the things each indicident from the firebase database will return when we request
interface Incident {
  id: string;
  type: string; //this is something like "sexual-harrasment"
  severity: string; //this is "high", "medium", or "low"
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

  const [incidents, setIncidents] = useState<Incident[]>([]); // defining incidents as an array of Incident objects
  const [lastUpdated, setLastUpdated] = useState<string | null>(null); // New state for last updated time

  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 7 days ago
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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

        incidentsData = incidentsData.filter(incident => {
          const incidentDate = new Date(incident.timestamp);
          return (selectedSeverity === 'all' || incident.severity === selectedSeverity) &&
                 incidentDate >= startDate && incidentDate <= endDate;
        });
        
        // Filter incidents based on current selectedSeverity state
        if (selectedSeverity !== 'all') {
          incidentsData = incidentsData.filter(incident => incident.severity === selectedSeverity);
        }
        
        setIncidents(incidentsData);
        const points = incidentsData.length > 0 
            ? incidentsData.map((incident) => ({
              latitude: incident.location.latitude,
              longitude: incident.location.longitude,
              weight: getPointWeight(incident.severity), // Corrected here
              type: incident.severity,
            }))
          : [];
        setHeatmapPoints(points);
        const now = new Date();
        setLastUpdated(now.toISOString()); // Use ISO format for consistency
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
//i should add something like last updated on (insert time)
  useEffect(() => {
    fetchIncidents();
  }, [selectedSeverity, startDate, endDate]);

  const onChangeStartDate = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const onChangeEndDate = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || endDate;
    setShowEndPicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

    const campusCoords = {
      latitude: 40.0996,
      longitude: -88.229,
      latitudeDelta: 0.0425,
      longitudeDelta: 0.0001,
    };

    const centerMap = () => {  
      mapRef.current.animateToRegion(campusCoords, 1000);
    };

  return (
    <View style={styles.container}>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedSeverity}
          onValueChange={(itemValue) => setSelectedSeverity(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="All Incidents" value="all" />
          <Picker.Item label="Low Severity" value="low" />
          <Picker.Item label="Medium Severity" value="medium" />
          <Picker.Item label="High Severity" value="high" />
        </Picker>
      </View>
      <View style={styles.datePickerContainer}>
        <Button onPress={() => setShowStartPicker(true)} title="Start Date" />
        <Text>{startDate.toLocaleDateString()}</Text>
        {showStartPicker && (
          <DateTimePicker
            testID="startDatePicker"
            value={startDate}
            mode="date"
            display="default"
            onChange={onChangeStartDate}
          />
        )}
        <Button onPress={() => setShowEndPicker(true)} title="End Date" />
        <Text>{endDate.toLocaleDateString()}</Text>
        {showEndPicker && (
          <DateTimePicker
            testID="endDatePicker"
            value={endDate}
            mode="date"
            display="default"
            onChange={onChangeEndDate}
          />
        )}
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
      {heatmapPoints.length > 0 &&
        pointTypes.map((type) => {
          const filteredPoints = heatmapPoints.filter((point) => point.type === type);
          if (filteredPoints.length === 0) return null; // Skip rendering if no points for this type
          return (
            <Heatmap
              key={type}
              points={filteredPoints}
              radius={50}
              opacity={0.6}
              gradient={{
                colors: ["black", "darkred", "yellow", "white"],
                startPoints: Platform.OS === "ios" ? [0.05, 0.11, 0.25, 0.45] : [0.1, 0.22, 0.5, 0.8],
                colorMapSize: 256,
              }}
            />
          );
        })}
      </MapView>
      <Pressable style={styles.centerButton} onPress={() => centerMap()}>
        <Text style={styles.buttonText}>Re-Center To Whole Campus</Text>
      </Pressable>
      <View style={styles.lastUpdatedContainer}>
        <Text style={styles.lastUpdatedText}>
          Last Updated: {formatLastUpdated(lastUpdated)}
        </Text>
      </View>
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
    zIndex: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerWrapper: {
    backgroundColor: 'white',
    borderRadius: 50, // Fully circular
    overflow: 'hidden', // Ensure the Picker stays within the circle
    padding: 5, // Add padding for better layout
    margin: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  picker: {
    width: '100%',
    backgroundColor: 'transparent', // Ensure the Picker itself is also transparent
  },
  pickerItem: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
  }, 
  lastUpdatedContainer: {
    position: "absolute",
    right: 10, // Move it to the right side of the screen
    bottom: 70, // You can adjust the bottom margin if needed
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 5,
    borderRadius: 5,
  },
  lastUpdatedText: {
    color: "white",
    fontSize: 12,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 10,
  },
});