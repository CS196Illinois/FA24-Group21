import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import Button from "../../components/Button";
import SubmitButton from "../../components/SubmitButton";
import * as Location from 'expo-location';
import { database } from "../../configs/firebaseConfig"
import { ref, push, set, update, child } from 'firebase/database';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Image } from "expo-image";
import { useLocalSearchParams } from 'expo-router';

export default function AddIncident() {
    const params = useLocalSearchParams();
    const { latitude, longitude } = params;
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [timestamp, setTimestamp] = useState<number | undefined>(undefined);
    const date = new Date();
    const [type, setType] = useState<string | undefined>(undefined);
    const [photos, setPhotos] = useState<string[]>([]);
    const [severity, setSeverity] = useState<string | undefined>('Choose Severity');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Location permissions denied');
                console.log(errorMsg);
            }
            loadLocation();
        })();
    }, []);

    const loadLocation = async () => {
        let location = await Location.getCurrentPositionAsync();
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
        setTimestamp(location.timestamp);
        date.setMilliseconds(location.timestamp);
    }

    function toTwoDigits(num: number) {
        return num.toString().padStart(2, '0');
    }

    function formattedDate(date: Date) {
        return toTwoDigits((date.getMonth() + 1)) + "/" + toTwoDigits(date.getDate()) + "/" + date.getFullYear() + " " + toTwoDigits(date.getHours()) + ":" + toTwoDigits(date.getMinutes()) + ":" + toTwoDigits(date.getSeconds());
    }

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1
        })

        if (!result.canceled) {
            let photoArrUri = [];
            for (let i = 0; i <= result.assets.length; i++) {
                photoArrUri[i] = result.assets[i].uri;
            }
            setPhotos(photoArrUri);
        } else {
            alert('No images selected');
        }
    };

    const addIncident = () => {
        if (timestamp != undefined && latitude != undefined && longitude != undefined && type != undefined && severity != undefined) {
            const ourReference = push(ref(database, 'incidents'));

            set(ourReference, {
                location: {
                    longitude,
                    latitude
                },
                type,
                severity,
                timestamp
            });
            if (description != undefined && description.length > 0) {
                update(ourReference, { description: description });
            }
            if (photos.length > 0) {
                // update(ourReference, {description: description});
            }
        } else {
            alert('Complete the form please!');
        }
    }

    const addDescrption = () => {
        alert(description + " added");
    }
    // <Image source="https://drive.google.com/file/d/1O4CeHSwUJk0i6HKVlsac3PxodVhONePg/view?usp=sharing" />
    return (
        <GestureHandlerRootView >
            <View style={[styles.genericContainer, { flexDirection: 'row' }]}>
                <View style={{flex: 1}}>
                    <Text style={styles.textInput}>
                        Latitude: {latitude}    Longitude: {longitude}
                    </Text>
                </View>
                <View style={{flex: 1}}>
                    <Button label="Update Location:" onPress={loadLocation} />
                </View>
            </View>
            <View style={[styles.pickerContainer, { flexDirection: 'row' }]}>
                <Picker style={styles.pickerDropDown}
                    selectedValue={type}
                    onValueChange={(itemValue) => setType(itemValue)}>
                    <Picker.Item label="Choose type" value={undefined} />
                    <Picker.Item label="Harrassment" value="Harrassment" />
                    <Picker.Item label="Drunk Driving" value="Drunk Driving" />
                    <Picker.Item label="High Noise" value="High Noise" />
                    <Picker.Item label="Other" value="Other" />
                </Picker>
            </View>
            <View style={[styles.pickerContainer, { flexDirection: 'row' }]}>
                <Picker style={styles.pickerDropDown}
                    selectedValue={severity}
                    onValueChange={(itemValue) => setSeverity(itemValue)}>
                    <Picker.Item label="Choose Severity" value={undefined} />
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
                    value={formattedDate(date)}
                    keyboardType="numeric"
                >
                </TextInput>
            </View>
            <View style={styles.textContainer}>
                <TextInput
                    defaultValue="Type Description Here..."
                    selectTextOnFocus
                    style={styles.textInput}
                    multiline
                    editable
                    numberOfLines={1}
                    onChangeText={text => setDescription(text)}
                    value={description}
                >
                </TextInput>
            </View>
            <View style={{justifyContent: 'center', marginLeft: '40%'}}>
                <Button label="Submit Photos" onPress={pickImageAsync} />
            </View>
            <SubmitButton label="Submit Incident" onPress={addIncident} />
        </GestureHandlerRootView>
    );
}
const styles = StyleSheet.create({
    textContainer: {
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
        height: 60,
        width: '100%',
        marginRight: '10%',
        marginLeft: '10%',
        borderWidth: 1,
        marginTop: 10,
        marginBottom: 10,
        alignSelf: 'center',
        justifyContent: 'center'
    },
    pickerContainer: {
        borderWidth: 1,
        width: 'auto',
        margin: 5,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    pickerDropDown: {
        flex: 1,
        width: 180,
        borderWidth: 1,
    },
    mainContainer: {
        height: 73
    }
});