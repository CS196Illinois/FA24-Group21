import { Text, View, StyleSheet } from 'react-native';

export default function AddIncident() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Statistics</Text>
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
