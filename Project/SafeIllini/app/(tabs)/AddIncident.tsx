import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Platform, Pressable } from 'react-native';
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import Button from "../../components/Button";
import * as Location from 'expo-location';
import { database, auth } from "../../configs/firebaseConfig"
import { ref, push, set } from 'firebase/database';
import { Picker } from '@react-native-picker/picker';

export default function AddIncident() {
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [time, setTime] = useState<number | undefined>(undefined);
    const date = new Date();
    const [type, setType] = useState<string | undefined>(undefined);
    const [photos, setPhotos] = useState(new Map());
    const [severity, setSeverity] = useState<string | undefined>('Choose Severity');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Location permissions denied');
            }
            loadLocation();
        })();
    }, []);

    const loadLocation = async () => {
        let location = await Location.getCurrentPositionAsync();
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
        setTime(location.timestamp);
        date.setSeconds(location.timestamp);
    }

    const addIncident = () => {
        // Check if severity is chosen
        if (severity === 'Choose Severity') {
            setSeverity(undefined);
            alert("Please select a severity level.");
            return;
        }

        // Check if latitude and longitude are available
        if (latitude === undefined || longitude === undefined) {
            alert("Location is not available.");
            return;
        }

        // Check if description is provided
        if (!description) {
            alert("Please add a description.");
            return;
        }

        // Create a reference in Firebase and push the new incident
        const incidentRef = push(ref(database, 'incidents'));

        // Create the incident object
        const incident = {
            location: {
                latitude: latitude,
                longitude: longitude
            },
            type: type,  // Make sure this is being set or handled
            severity: severity,
            time: time,
            description: description,
            photos: photos,  // Handle photos if needed
        };

        // Save the incident to Firebase
        set(incidentRef, incident)
            .then(() => {
                alert("Incident Added!");
                // Optionally reset the form after adding the incident
                setLatitude(undefined);
                setLongitude(undefined);
                setDescription(undefined);
                setSeverity('Choose Severity');
            })
            .catch((error) => {
                alert("Error adding incident: " + error.message);
            });
    };

    const addDescription = () => {
        alert(description + " added");
    };

    return (
        <GestureHandlerRootView>
            <View>
                <View style={styles.genericContainer}>
                    <Text style={styles.textInput}>
                        Latitude: {latitude}    Longitude: {longitude}
                    </Text>
                </View>
                <Button label="Update Location:" onPress={loadLocation} />
                <View style={styles.severityContainer}>
                    <Picker style={styles.severityDropDown}
                        selectedValue={severity}
                        onValueChange={(itemValue) =>
                            setSeverity(itemValue)
                        }>
                        <Picker.Item label="Choose Severity" value={null} />
                        <Picker.Item label="Low" value="Low" />
                        <Picker.Item label="Medium" value="Medium" />
                        <Picker.Item label="High" value="High" />
                    </Picker>
                </View>
                <View style={styles.genericContainer}>
                    <TextInput
                        style={styles.textInput}
                        multiline
                        editable
                        numberOfLines={1}
                        onChangeText={text => (alert("Time change function not implemented yet"))}
                        value={date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()}
                        keyboardType="numeric"
                    >
                    </TextInput>
                </View>
                <View style={styles.screenContainer}>
                    <TextInput
                        style={styles.textInput}
                        multiline
                        editable
                        numberOfLines={1}
                        onChangeText={text => setDescription(text)}
                        value={description}
                    >
                    </TextInput>
                </View>
                <Button label="Description:" onPress={addDescription} />
                <Button label="Submit Incident" onPress={addIncident} />
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        backgroundColor: "000000",
        height: 100,
        width: '80%',
        marginRight: '10%',
        marginLeft: '10%',
        borderWidth: 1
    },
    textInput: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        fontSize: 13
    },
    genericContainer: {
        height: 30,
        width: '80%',
        marginRight: '10%',
        marginLeft: '10%',
        borderWidth: 1,
        marginTop: 10,
        marginBottom: 10
    },
    severityContainer: {
        borderWidth: 1,
        width: '100%',
        margin: 5,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    severityDropDown: {
        width: 200,
        borderWidth: 1,
    }
});
