import { Text, StyleSheet, View } from "react-native";
import { database, auth } from "../configs/firebaseConfig"
import { ref, set, onValue } from 'firebase/database';
import MapView from 'react-native-maps';
import { Platform } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <MapView style={styles.map}
  initialRegion={{
    latitude: 40.78825,
    longitude: -88.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
