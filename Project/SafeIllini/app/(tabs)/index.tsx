/* eslint-disable import/no-unresolved */
import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Linking, Alert, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { database } from "@/configs/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { router } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import BottomSheet from "reanimated-bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Incident, IncidentType } from "@/types/incidents";
import { INCIDENT_TYPE_LABELS, PIN_COLORS } from "@/constants/Incidents";

export default function Home() {
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>("all");
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const incidentsRef = ref(database, "incidents");
    const unsubscribe = onValue(incidentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const incidentsData: Incident[] = [];
        snapshot.forEach((childSnapshot) => {
          incidentsData.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
        setIncidents(incidentsData);
      } else {
        setIncidents([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLongPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    router.push({
      pathname: "/AddIncident",
      params: { latitude, longitude },
    });
  };

  const callCampusPolice = () => {
    const campusPoliceNumber = "6308910198";
    Linking.openURL(`tel:${campusPoliceNumber}`).catch((err) => {
      console.error("Failed to open dialer:", err);
      Alert.alert("Error", "Unable to initiate the call. Please try again.");
    });
  };

  const getPinColor = (incidentType: IncidentType) => {
    return PIN_COLORS[incidentType] || "black";
  };

  const renderContent = () => (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.bottomSheetHeader}>Latest Incidents</Text>
      <FlatList
        data={incidents.slice(0, 5)} // Show only the latest 5 incidents
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.incidentItem}>
            <Text style={styles.incidentText}>{`Type: ${item.type.replace("_", " ").toUpperCase()}`}</Text>
            <Text style={styles.incidentText}>{`Severity: ${item.severity}`}</Text>
            <Text style={styles.incidentText}>{`Reported at: ${new Date(item.timestamp).toLocaleString()}`}</Text>
            <Text style={styles.incidentText}>{item.description || "No description provided"}</Text>
          </View>
        )}
      />
    </View>
  );

  const sheetRef = React.useRef(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedIncidentType}
            onValueChange={(itemValue) => setSelectedIncidentType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="All Incidents" value="all" />
            {INCIDENT_TYPE_LABELS.map(({ label, value }) => (
              <Picker.Item key={value} label={label} value={value} />
            ))}
          </Picker>
        </View>

        <MapView
          style={styles.map}
          mapType="satellite"
          initialRegion={{
            latitude: 40.102,
            longitude: -88.2272,
            latitudeDelta: 0.0222,
            longitudeDelta: 0.0121,
          }}
          onLongPress={handleLongPress}
        >
          {incidents
            .filter(
              (incident) =>
                selectedIncidentType === "all" || incident.type === selectedIncidentType
            )
            .map((incident) => (
              <Marker
                key={incident.id}
                coordinate={{
                  latitude: incident.location.latitude,
                  longitude: incident.location.longitude,
                }}
                pinColor={getPinColor(incident.type)}
                title={`${incident.type.replace("_", " ").toUpperCase()} - ${incident.severity}`}
                description={
                  incident.description ||
                  `Reported at ${new Date(incident.timestamp).toLocaleString()}`
                }
              />
            ))}
        </MapView>

        <TouchableOpacity style={styles.sosButton} onPress={callCampusPolice}>
          <Text style={styles.sosButtonText}>SOS</Text>
        </TouchableOpacity>

        <BottomSheet
          ref={sheetRef}
          snapPoints={[300, 100]}
          borderRadius={20}
          renderContent={renderContent}
        />
      </View>
    </GestureHandlerRootView>
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 20,
  },
  picker: {
    width: "100%",
  },
  map: {
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sosButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  bottomSheetContent: {
    backgroundColor: "#fff",
    padding: 16,
    height: 300,
  },
  bottomSheetHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  incidentItem: {
    marginBottom: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  incidentText: {
    fontSize: 14,
    marginBottom: 5,
  },
});
