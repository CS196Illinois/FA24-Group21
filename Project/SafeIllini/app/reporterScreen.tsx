import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Text, View, StyleSheet, Platform, Pressable } from 'react-native';
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import Button from "../components/Button";
import * as Location from 'expo-location';
import { database, auth } from "../configs/firebaseConfig"
import { ref, getDatabase, push, set, onValue, child, get } from 'firebase/database';

export default function ReporterScreen() {
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [severity, setSeverity] = useState<string | undefined>(undefined);
    const [time, setTime] = useState<number | undefined>(undefined);
    const date = new Date();
    const [type, setType] = useState<string | undefined>(undefined);
    const [photos, setPhotos] = useState(new Map());
    const severityLevels = ['High', 'Moderate', 'Low'];
    /*    interface Incident {
            id: string,
            location: {
                longitude: number,
                latitude: number
            },
            type: string,
            severity: string,
            time: number,
            photos?: Map<number, string>;
            description?: string
        }
    */
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
        const ourReference = push(ref(database, 'incidents'));
        const id = ourReference.toString();
        /* set(ourReference, {
            location: {
                longitude,
                latitude
            },
            type,
            severity,
            time,
            photos,
            description
        });
        */
        alert(id);

    }

    const addDescrption = () => {
        alert(description + " added");
    }

    return (
        <GestureHandlerRootView>
            <View>
                // Implement reloading of what is displayed for coordinates and time after clicking on the location, dunno how
                <Pressable onPress={() => loadLocation()}>
                    <View style={styles.locationContainer}>
                        <Text style={styles.textInput}>
                            Latitude: {latitude}    Longitude: {longitude}
                        </Text>
                    </View>
                </Pressable>
                <View style={styles.locationContainer}>
                    <TextInput
                        style={styles.textInput}
                        multiline
                        editable
                        numberOfLines={5}
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
                        numberOfLines={5}
                        onChangeText={text => setDescription(text)}
                        value={description}
                    >
                    </TextInput>
                </View>
                <Button label="Description:" onPress={addDescrption} />
                <Button label="Submit Incident" onPress={addIncident} />
            </View>
        </GestureHandlerRootView>
        /* 
        * Header
        * Incident Report
        * Button
        * Another Button
        * 
        * Time Selection
        * 
        * 
        * Bar at the bottom
        */
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
        fontSize: 15
    },
    locationContainer: {
        height: 30,
        width: '80%',
        marginRight: '10%',
        marginLeft: '10%',
        borderWidth: 1,
        marginTop: 10,
        marginBottom: 10
    }
});