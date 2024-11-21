/* eslint-disable import/no-unresolved */
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import Button from "../../components/Button";
import * as Location from 'expo-location';
import { database } from "../../configs/firebaseConfig"
import { ref, push, set, update, child } from 'firebase/database';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Image } from "expo-image";
import { useLocalSearchParams } from 'expo-router';

import { Incident, IncidentType, SeverityLevel } from '@/types/incidents';
import { INCIDENT_TYPE_LABELS, SEVERITY_LEVEL_LABELS } from '@/constants/Incidents';

interface LocationState {
  latitude: number | undefined;
  longitude: number | undefined;
  timestamp: number | undefined;
}

export default function AddIncident() {
  const params = useLocalSearchParams();
  // console.log("params: ", params);
  const [location, setLocation] = useState<LocationState>({
    // conditional (ternary) operator to set default location values
    // if params.latitude is defined, use it, otherwise use undefined
    latitude: params.latitude ? Number(params.latitude) : undefined,
    longitude: params.longitude ? Number(params.longitude) : undefined,
    timestamp: Date.now()
  });
  // console.log("location: ", location);
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [type, setType] = useState<IncidentType>('other');
  const [photos, setPhotos] = useState<string[]>([]);
  const [severity, setSeverity] = useState<SeverityLevel>('low');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  

  // useEffect hook to request location permissions on mount,
  // and update location state if user passes in any coords from the Home Screen through the LongPress
  // will rerender screen whenever params.latitude or params.longitude change
  useEffect(() => {
    // console.log("usEffect triggered");
    if (!params.latitude || !params.longitude) {
      requestLocationPermission();
    } else {
      setLocation({
        latitude: Number(params.latitude),
        longitude: Number(params.longitude),
        timestamp: Date.now()
      });
    }
  }, [params.latitude, params.longitude]);

  // adding a new function to requestLocationPermission only if the user didn't pass in any coords
  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Location permissions denied');
      console.log(errorMsg);
    }
    loadLocation();
  };

  const loadLocation = async () => {
    // just adding try catch block to handle any errors
    try {
      let location = await Location.getCurrentPositionAsync();
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp
      });
      setDate(new Date(location.timestamp));
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load location');
    }
  }

  const pickImageAsync = async () => {
    // just adding try catch block to handle any errors
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1
      })
      // only if result.cancelled is false and result.assets is not empty
      if (!result.canceled && result.assets.length > 0) {
        // let photoArrUri = [];
        // for (let i = 0; i <= result.assets.length; i++) {
        //     photoArrUri[i] = result.assets[i].uri;
        // }
        // above can be turned into a more efficient way using map function
        const photoUris = result.assets.map(asset => asset.uri);
        setPhotos(photoUris);
      } else {
        // using React Native's Alert component to display error message rather than just alert
        Alert.alert('No images selected');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const addIncident = () => {
    // just adding a check to make sure all required fields are filled out
    // don't have to compare with undefined, null, or empty strings, just check if they are truthy
    // if they are falsy, then they are undefined, null, or empty strings
    if (!location.latitude || !location.longitude || !type || !severity) {
      Alert.alert('Error', 'Complete the form please!');
      return;
    }
    try {
      const ourReference = push(ref(database, 'incidents'));
      // changed to an optimized version of adding the incident data to database
      // BEFORE: 
      // Creates the base object first with set(), then conditionally updates it with additional fields using update()
      // set(ourReference, {
      //     location: {
      //         longitude,
      //         latitude
      //     },
      //     type,
      //     severity,
      //     timestamp
      // });
      // if (description != undefined && description.length > 0) {
      //     update(ourReference, { description: description });
      // }
      // if (photos.length > 0) {
      //     // update(ourReference, {description: description});
      // }

      // AFTER:
      // Creates a complete object upfront using spread operators and conditional properties, then sets it all at once
      // It automatically omits optional properties when they're not present because 
      // the spread operator with the logical AND (...(description && { description })) would evaluate to an empty object spread if description is undefined
      // - More efficient b/c it reduces two database operations to a single call 
      // - and it creates the complete object structure before writing to the database
      const incidentData = {
        location: {
          longitude: location.longitude,
          latitude: location.latitude
        },
        type,
        severity,
        timestamp: location.timestamp,
        // below is shorthand for ...(description && { description: description }) "description" is the field name if included
        ...(description && { description }),
        // below is shorthand for ...(photos.length > 0 && { photos }) "photos" is the field name if included
        ...(photos.length > 0 && { photos }) // "photos" is the field name if included
      }
      set(ourReference, incidentData);
      Alert.alert('Success', 'Incident reported successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add incident');
    }
  }

  const addDescrption = () => {
    alert(description + " added");
  }
  // function to format date and time just to have cleaner code
  // don't have to use + operator to concatenate strings, it's more efficient to use template literals
  const formatDateTime = (date: Date): string => {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.genericContainer}>
        <Text style={styles.textInput}>
          Latitude: {location.latitude?.toFixed(6)} Longitude: {location.longitude?.toFixed(6)}
        </Text>
      </View>
      <Button label="Update Location:" onPress={loadLocation} />
      <View style={styles.pickerContainer}>
        <Picker style={styles.pickerDropDown}
          selectedValue={type}
          onValueChange={(itemValue) => setType(itemValue)}>
          {INCIDENT_TYPE_LABELS.map(({ label, value }) => (
            <Picker.Item key={value} label={label} value={value} />
          ))}
        </Picker>
      </View>
      {/* <View style={styles.genericContainer}>
        <Image source="https://drive.google.com/file/d/1O4CeHSwUJk0i6HKVlsac3PxodVhONePg/view?usp=sharing" />
      </View> */}
      <View style={styles.pickerContainer}>
        <Picker style={styles.pickerDropDown}
          selectedValue={severity}
          onValueChange={(itemValue) => setSeverity(itemValue)}>
          <Picker.Item label="Choose Severity" value={undefined} />
          {SEVERITY_LEVEL_LABELS.map(({ label, value }) => (
            <Picker.Item key={value} label={label} value={value} />
          ))}
        </Picker>
      </View>
      <View style={styles.genericContainer}>
        <TextInput
          style={styles.textInput}
          multiline
          editable
          numberOfLines={1}
          onChangeText={text => (alert("Time change function not implemented yet"))}
          value={formatDateTime(date)}
          keyboardType="numeric"
        >
        </TextInput>
      </View>
      <View style={styles.screenContainer}>
        <TextInput
          defaultValue="Type Description Here..."
          selectTextOnFocus
          style={styles.textInput}
          multiline
          editable
          numberOfLines={1}
          onChangeText={text => setDescription(text)} // you can also just do setDescription directly because it's a direct state update and it will automatically pass the text parameter
          value={description}
        >
        </TextInput>
      </View>
      <Button label="Submit Photos" onPress={pickImageAsync} />
      <Button label="Submit Incident" onPress={addIncident} />
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
  pickerContainer: {
    borderWidth: 1,
    width: '50%',
    margin: 5,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  pickerDropDown: {
    width: 180,
    borderWidth: 1,
  }
});