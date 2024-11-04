import React, { useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text, Linking, Alert, TouchableWithoutFeedback } from "react-native";
import { Picker } from "@react-native-picker/picker";


export default function Index() {
  const [selectedIncidentType, setSelectedIncidentType] = useState("all");
  const [pinPosition, setPinPosition] = useState(null);


  const handleLongPress = (event) => {
    const { locationX, locationY } = event.nativeEvent;


    // Simulated latitude and longitude based on screen touch
    const latitude = (locationY * 0.0001).toFixed(4);
    const longitude = (locationX * 0.0001).toFixed(4);


    setPinPosition({ x: locationX, y: locationY, latitude, longitude, type: selectedIncidentType });
  };


  // Function to call the UIUC Campus Police
  const callCampusPolice = () => {
    const campusPoliceNumber = "6308910198"; // Replace with the actual campus police number
    Linking.openURL(`tel:${campusPoliceNumber}`)
      .catch((err) => {
        console.error("Failed to open dialer:", err);
        Alert.alert("Error", "Unable to initiate the call. Please try again.");
      });
  };


  // Function to determine pin color based on incident type
  const getPinColor = (incidentType) => {
    switch (incidentType) {
      case "sexual_harassment":
        return "red";
      case "drunk_driving":
        return "orange";
      case "theft":
        return "yellow";
      case "assault":
        return "blue";
      default:
        return "green"; // Default color for 'all' or unspecified
    }
  };


  return (
    <View style={styles.container}>
      {/* Dropdown for Incident Types */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedIncidentType}
          onValueChange={(itemValue) => setSelectedIncidentType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Incident Types" value="all" />
          <Picker.Item label="Sexual Harassment" value="sexual_harassment" />
          <Picker.Item label="Drunk Driving" value="drunk_driving" />
          <Picker.Item label="Theft" value="theft" />
          <Picker.Item label="Assault" value="assault" />
          {/* Add more incident types as needed */}
        </Picker>
      </View>


      {/* Background Image with Long Press to Add Pin */}
      <TouchableWithoutFeedback onLongPress={handleLongPress}>
        <Image
          source={{ uri: "https://scs.illinois.edu/sites/default/files/inline-images/nl_campus_map.gif" }} // Replace with actual image URL
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableWithoutFeedback>


      {/* SOS Button */}
      <TouchableOpacity style={styles.sosButton} onPress={callCampusPolice}>
        <Text style={styles.sosButtonText}>SOS</Text>
      </TouchableOpacity>


      {/* Pin and Coordinate Bubble */}
      {pinPosition && (
        <View style={[styles.pinContainer, { top: pinPosition.y - 50, left: pinPosition.x - 10 }]}>
          <View style={[styles.pin, { backgroundColor: getPinColor(pinPosition.type) }]} />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Lat: {pinPosition.latitude}</Text>
            <Text style={styles.bubbleText}>Lon: {pinPosition.longitude}</Text>
          </View>
        </View>
      )}
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
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent background
    paddingHorizontal: 20,
  },
  picker: {
    width: "100%",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  sosButton: {
    position: "absolute",
    right: 20,
    bottom: 40,
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  sosButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  pinContainer: {
    position: "absolute",
    alignItems: "center",
  },
  pin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: "white",
    borderWidth: 2,
  },
  bubble: {
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
  },
  bubbleText: {
    color: "white",
    fontSize: 12,
  },
});

