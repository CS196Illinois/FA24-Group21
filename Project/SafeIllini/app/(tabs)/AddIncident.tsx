import { Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function AddIncident() {
  const params = useLocalSearchParams();
  const { latitude, longitude } = params;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{latitude},{longitude}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
});
