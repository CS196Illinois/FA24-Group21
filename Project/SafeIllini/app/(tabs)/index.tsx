import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Linking, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';

function Index() {
  const [selectedIncidentType, setSelectedIncidentType] = useState("all");
  const [incidents, setIncidents] = useState([
    {
      id: "1",
      type: "sexual_harassment",
      location: { latitude: 40.107491, longitude: -88.227203 },
    },
    {
      id: "2",
      type: "drunk_driving",
      location: { latitude: 40.108491, longitude: -88.228203 },
    },
    {
      id: "3",
      type: "theft",
      location: { latitude: 40.109491, longitude: -88.229203 },
    },
    {
      id: "4",
      type: "assault",
      location: { latitude: 40.110491, longitude: -88.230203 },
    },
  ]);
  const navigation = useNavigation();

  const handleLongPress = (event) => {
    const { coordinate } = event.nativeEvent;
    navigation.navigate('AddIncident', { coordinate });
  };

  const callCampusPolice = () => {
    const campusPoliceNumber = "6308910198";
    Linking.openURL(`tel:${campusPoliceNumber}`)
      .catch((err) => {
        console.error("Failed to open dialer:", err);
        Alert.alert("Error", "Unable to initiate the call. Please try again.");
      });
  };

  const getPinColor = (incidentType) => {
    switch (incidentType) {
      case "sexual_harassment": return "red";
      case "drunk_driving": return "orange";
      case "theft": return "yellow";
      case "assault": return "blue";
      default: return "green";
    }
  };

  const filteredIncidents = selectedIncidentType === 'all'
    ? incidents
    : incidents.filter(incident => incident.type === selectedIncidentType);

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

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 40.107491,
            longitude: -88.227203,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onLongPress={handleLongPress}
        >
          {filteredIncidents.map((incident) => (
            <Marker
              key={incident.id}
              coordinate={incident.location}
              pinColor={getPinColor(incident.type)}
            />
          ))}
        </MapView>
      </View>

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
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 20,
  },
  picker: {
    width: "100%",
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  sosButton: {
    position: "absolute",
    right: 20,
    bottom: 40,
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    zIndex: 2,
  },
  sosButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Index;
