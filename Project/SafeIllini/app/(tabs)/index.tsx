import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Linking, Alert, FlatList, Modal } from "react-native";

import { Picker } from "@react-native-picker/picker";
import { database } from "@/configs/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { router } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { Incident, IncidentType } from "@/types/incidents";
import { INCIDENT_TYPE_LABELS, PIN_COLORS, SEVERITY_LEVEL_LABELS } from "@/constants/Incidents";
import { BottomSheetModal, BottomSheetView, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function Home() {
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>("all");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null); // State to track the selected incident
  const [modalVisible, setModalVisible] = useState(false); // State to track modal visibility
  

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["12%", "50%"], []);

  bottomSheetRef.current?.present();

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

  const handlePinLongPress = (incident: Incident) => {
    setSelectedIncident(incident);
    setModalVisible(true); // Open modal
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedIncident(null); // Clear selected incident
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


  const renderBottomSheetContent = () => {
    const latestIncidents = [...incidents]
      .sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp (most recent first)
      .slice(0, 5); // Get the latest 5 incidents
  
    // Helper functions to find labels from constants
    const getIncidentTypeLabel = (type: string) => {
      const typeObj = INCIDENT_TYPE_LABELS.find((item) => item.value === type);
      return typeObj ? typeObj.label : "Unknown Type";
    };
  
    const getSeverityLabel = (severity: string) => {
      const severityObj = SEVERITY_LEVEL_LABELS.find((item) => item.value === severity);
      return severityObj ? severityObj.label : "Unknown Severity";
    };
  
    return (
      <BottomSheetView style={[styles.bottomSheetContent, { flex: 1 }]}>
        <Text style={styles.bottomSheetHeader}>Latest Incidents</Text>
        <BottomSheetFlatList
          data={latestIncidents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }} // Adds padding to prevent cut-off
          keyboardShouldPersistTaps="handled" // Ensures the list is scrollable even with touch gestures
          renderItem={({ item }) => (
            <View style={styles.incidentItem}>
              <Text style={styles.incidentText}>
                {`Type: ${getIncidentTypeLabel(item.type)}`}
              </Text>
              <Text style={styles.incidentText}>
                {`Severity: ${getSeverityLabel(item.severity)}`}
              </Text>
              <Text style={styles.incidentText}>
                {`Reported at: ${new Date(item.timestamp).toLocaleString()}`}
              </Text>
              <Text style={styles.incidentText}>
                {item.description || "No description provided"}
              </Text>
            </View>
          )}
        />
      </BottomSheetView>
    );
  };
  


  const sheetRef = React.useRef(null);

  const presentBottomSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <BottomSheetModalProvider>
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
            
              onPress={() => handlePinLongPress(incident)} // Trigger modal on long press
            />
          ))}
      </MapView>

      <TouchableOpacity style={styles.sosButton} onPress={callCampusPolice}>
        <Text style={styles.sosButtonText}>SOS</Text>
      </TouchableOpacity>

      <BottomSheetModal ref={bottomSheetRef} index={0} snapPoints={snapPoints} enableDismissOnClose={false} enablePanDownToClose={false}>
          {renderBottomSheetContent()}
      </BottomSheetModal>

      {/* Modal for displaying incident details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
  <View style={styles.modalContent}>
    {selectedIncident && (
      <>
        <Text style={styles.modalTitle}>Incident Details</Text>
        <Text>
          Type:{" "}
          {
            INCIDENT_TYPE_LABELS.find((item) => item.value === selectedIncident.type)?.label ||
            "Unknown Type"
          }
        </Text>
        <Text>
          Severity:{" "}
          {
            SEVERITY_LEVEL_LABELS.find((item) => item.value === selectedIncident.severity)?.label ||
            "Unknown Severity"
          }
        </Text>
        <Text>
          Description: {selectedIncident.description || "No description available"}
        </Text>
        <Text>
          Reported At:{" "}
          {new Date(selectedIncident.timestamp).toLocaleString()}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
</View>

      </Modal>
    </View>
    </BottomSheetModalProvider>
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
  },
  sosButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
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
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "red",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
