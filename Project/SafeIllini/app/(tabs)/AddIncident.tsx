/* eslint-disable import/no-unresolved */
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import Button from "@/components/Button";
import SubmitButton from "../../components/SubmitButton";
import ThumbnailView from "../../components/ThumbnailView";
import * as Location from 'expo-location';
import { database } from "@/configs/firebaseConfig"
import { ref, push, set, update, child } from 'firebase/database';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

// Import the necessary types and constants from the shared types and constants folder
import { Incident, IncidentType, SeverityLevel } from '@/types/incidents';
import { INCIDENT_TYPE_LABELS, SEVERITY_LEVEL_LABELS } from '@/constants/Incidents';

// import the styles from the shared styles folder
import { addIncidentStyles } from '@/constants/Styles';

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
  const [formKey, setFormKey] = useState(0); // used to trigger a re-render of the form
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  // useEffect hook to request location permissions on mount,
  // and update location state if user passes in any coords from the Home Screen through the LongPress
  // will rerender screen whenever params.latitude or params.longitude change
  useEffect(() => {
    // console.log("usEffect triggered");
    if (!params.latitude || !params.longitude) {
      requestAndUpdateLocation();
    } else {
      setLocation({
        latitude: Number(params.latitude),
        longitude: Number(params.longitude),
        timestamp: Date.now()
      });
    }
  }, [params.latitude, params.longitude]);

  const requestAndUpdateLocation = async () => {
    try {
      // first check if we already have permissions
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      // only request permissions if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permissions denied');
          console.log(errorMsg);
          return false; // allows useEffect hook to run again after permissions are granted
        }
      }
      // basically old loadLocation function
      // get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp
      });

      return true; // necessary to return true because otherwise, the useEffect hook will not run again
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to access location');
      return false;
    }
  }

  const pickImageAsync = async () => {
    // just adding try catch block to handle any errors
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: 5
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

  const takeImageAsync = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 2
    })
    if (!result.canceled && result.assets.length > 0) {
      const photoUris = result.assets.map(asset => asset.uri);
      saveImage(result.assets[0].uri);
      setPhotos(photoUris);
    } else {
      Alert.alert('No image taken');
    }
  }

  const saveImage = async (uri: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        await MediaLibrary.saveToLibraryAsync(uri);
      }
    } catch (error) {
      console.log(error);
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

      // reset form fields
      setLocation({
        latitude: undefined,
        longitude: undefined,
        timestamp: undefined
      });
      setType('other');
      setSeverity('low');
      if (description) { setDescription('') };
      if (photos) { setPhotos([]) };

      setFormKey(prevKey => prevKey + 1); // trigger a re-render of the form
      Alert.alert('Success', 'Incident reported successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add incident');
    }
  }

  function toTwoDigits(num: number) {
    return num.toString().padStart(2, '0');
  }

  // function to format date and time just to have cleaner code
  // don't have to use + operator to concatenate strings, it's more efficient to use template literals
  const formatDateTime = (date: Date): string => {
    return `${toTwoDigits(date.getMonth() + 1)}/${toTwoDigits(date.getDate())}/${date.getFullYear()} ${toTwoDigits(date.getHours())}:${toTwoDigits(date.getMinutes())}`;
  };

  return (
    <GestureHandlerRootView style={{ 'flex': 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={addIncidentStyles.container}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={addIncidentStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          key={formKey}
        >
          <View style={addIncidentStyles.card}>
            <Text style={addIncidentStyles.label}>Location</Text>
            <View style={addIncidentStyles.locationDateContainer}>
              <Text style={addIncidentStyles.coords}>
                Lat: {location.latitude?.toFixed(6)}
              </Text>
              <Text style={addIncidentStyles.coords}>
                Long: {location.longitude?.toFixed(6)}
              </Text>
            </View>
            <Button
              label="Update Location"
              onPress={requestAndUpdateLocation} />
          </View>

          <View style={addIncidentStyles.card}>
            <Text style={addIncidentStyles.label}>Time</Text>
            <View style={addIncidentStyles.locationDateContainer}>
              <Text style={addIncidentStyles.dateTime}>{formatDateTime(date)}</Text>
            </View>
            <Button onPress={() => {
              setShowTimePicker(!showTimePicker);
            }} label="Change Time" />
            {showTimePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="time"

                is24Hour={true}
                onChange={(event, newDate) => {
                  setDate(newDate);
                  setShowTimePicker(false);
                }}
              />
            )

            }
          </View>
          <View style={addIncidentStyles.card}>
            <Text style={addIncidentStyles.label}>Incident Details</Text>
            <View style={addIncidentStyles.pickerContainer}>
              <Picker style={addIncidentStyles.pickerDropDown}
                selectedValue={type}
                onValueChange={(itemValue) => setType(itemValue)}
              >
                {INCIDENT_TYPE_LABELS.map(({ label, value }) => (
                  <Picker.Item key={value} label={label} value={value} />
                ))}
              </Picker>
            </View>
            <View style={addIncidentStyles.pickerContainer}>
              <Picker style={addIncidentStyles.pickerDropDown}
                selectedValue={severity}
                onValueChange={(itemValue) => setSeverity(itemValue)}
              >
                <Picker.Item label="Choose Severity" value={undefined} />
                {SEVERITY_LEVEL_LABELS.map(({ label, value }) => (
                  <Picker.Item key={value} label={label} value={value} />
                ))}
              </Picker>
            </View>

            <TextInput
              style={addIncidentStyles.descriptionInput}
              placeholder='Please describe the incident'
              placeholderTextColor={'#686'}
              // selectTextOnFocus
              multiline
              editable
              onChangeText={text => setDescription(text)} // you can also just do setDescription directly because it's a direct state update and it will automatically pass the text parameter
              value={description}
            />
          </View>
          <View style={addIncidentStyles.buttonGroup}>
            <Button
              label="Add Photos"
              onPress={pickImageAsync}
            // style={addIncidentStyles.button}
            />
            {photos.length > 0 && (
              <><View style={addIncidentStyles.displayPhotos}>
                {photos.map(source => (
                  <ThumbnailView imgSource={source} />
                ))}
              </View><Button
                  label="Delete Photos"
                  onPress={() => setPhotos([])} /></>
            )}
            <Button
              label="Submit Incident"
              onPress={addIncident}
              // variant='secondary'
              style={addIncidentStyles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}



// Old viewport
// <GestureHandlerRootView style={styles.container}>
//   <View style={styles.genericContainer}>
//     <Text style={styles.textInput}>
//       Latitude: {location.latitude?.toFixed(6)} Longitude: {location.longitude?.toFixed(6)}
//     </Text>
//   </View>
//   <Button label="Update Location:" onPress={requestAndUpdateLocation} />
//   <View style={styles.pickerContainer}>
//     <Picker style={styles.pickerDropDown}
//       selectedValue={type}
//       onValueChange={(itemValue) => setType(itemValue)}>
//       {INCIDENT_TYPE_LABELS.map(({ label, value }) => (
//         <Picker.Item key={value} label={label} value={value} />
//       ))}
//     </Picker>
//   </View>
//   {/* <View style={styles.genericContainer}>
//     <Image source="https://drive.google.com/file/d/1O4CeHSwUJk0i6HKVlsac3PxodVhONePg/view?usp=sharing" />
//   </View> */}
//   <View style={styles.pickerContainer}>
//     <Picker style={styles.pickerDropDown}
//       selectedValue={severity}
//       onValueChange={(itemValue) => setSeverity(itemValue)}>
//       <Picker.Item label="Choose Severity" value={undefined} />
//       {SEVERITY_LEVEL_LABELS.map(({ label, value }) => (
//         <Picker.Item key={value} label={label} value={value} />
//       ))}
//     </Picker>
//   </View>
//   <View style={styles.genericContainer}>
//     <TextInput
//       style={styles.textInput}
//       multiline
//       editable
//       numberOfLines={1}
//       onChangeText={text => (alert("Time change function not implemented yet"))}
//       value={formatDateTime(date)}
//       keyboardType="numeric"
//     >
//     </TextInput>
//   </View>
//   <View style={styles.descriptionContainer}>
//     <TextInput
//       defaultValue="Type Description Here..."
//       selectTextOnFocus
//       style={styles.textInput}
//       multiline
//       editable
//       numberOfLines={1}
//       onChangeText={text => setDescription(text)} // you can also just do setDescription directly because it's a direct state update and it will automatically pass the text parameter
//       value={description}
//     >
//     </TextInput>
//   </View>
//   <Button label="Submit Photos" onPress={pickImageAsync} />
//   <Button label="Submit Incident" onPress={addIncident} />
// </GestureHandlerRootView>