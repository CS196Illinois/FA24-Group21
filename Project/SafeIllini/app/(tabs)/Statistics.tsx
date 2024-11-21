import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BarChart } from 'react-native-chart-kit';
import { database } from '../../configs/firebaseConfig'; // Import the Firebase configuration
import { ref, onValue } from 'firebase/database';
import { Dayjs } from 'dayjs';
import { } from 'react-native';

const StatisticsScreen = () => {
  const { width, height } = useWindowDimensions();
  const chartWidth = width * 0.9; // 90% of screen width
  const chartHeight = height * 0.3; // 30% of screen height
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedTime, setSelectedTime] = useState<string>('all');
  const [filteredData, setFilteredData] = useState<Incident[]>([]);

  interface Incident {
    id: string;
    description: string;
    location: {
      latitude: number;
      longitude: number;
    };
    severity: string;
    timestamp: number;
    type: string;
    photos?: string[];
  }

  // Update the data fetching logic
  useEffect(() => {
    const incidentsRef = ref(database, 'incidents');
    const unsubscribe = onValue(incidentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Transform the nested structure into our Incident array
        const formattedData: Incident[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          description: value.description,
          location: {
            latitude: value.location.latitude,
            longitude: value.location.longitude
          },
          severity: value.severity,
          timestamp: value.timestamp,
          type: value.type,
          photos: value.photos || []
        }));
        setIncidents(formattedData);
      } else {
        setIncidents([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const now = Date.now();

    const filtered = incidents.filter((incident) => {
      // Match severity
      const matchesSeverity =
        selectedSeverity === 'all' || incident.severity === selectedSeverity;

      // Match time (assuming 'timeFilters' provides duration in milliseconds)

      // Define the timeFilters object at the component level
      const timeFilters: Record<string, number> = {
        'all': Infinity,
        'last 1 hour': 60 * 60 * 1000,
        'last 24 hours': 24 * 60 * 60 * 1000,
        'last 1 week': 7 * 24 * 60 * 60 * 1000,
        'last 1 month': 30 * 24 * 60 * 60 * 1000
      };

      // Update the time matching logic
      const matchesTime =
        selectedTime === 'all' ||
        (now - incident.timestamp <= timeFilters[selectedTime]);

      return matchesSeverity && matchesTime;
    });

    setFilteredData(filtered);
  }, [incidents, selectedSeverity, selectedTime]);


  const generateChartData = () => {
    const types = ['sexual_harassment', 'drunk_driving', 'theft'];
    const data = types.map(
      (type) => filteredData.filter((incident) => incident.type === type).length
    );

    return {
      labels: ['Sexual Harassment', 'Drunk Driving', 'Theft'],
      datasets: [
        {
          data,
        },
      ],
    };
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Incident Statistics</Text>

      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Severity:</Text>
        <Picker
          selectedValue={selectedSeverity}
          style={styles.dropdown}
          onValueChange={(itemValue: React.SetStateAction<string>) => setSelectedSeverity(itemValue)}
        >
          <Picker.Item label="All" value="all" />
          <Picker.Item label="Low" value="low" />
          <Picker.Item label="Medium" value="medium" />
          <Picker.Item label="High" value="high" />
        </Picker>
      </View>

      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Time:</Text>
        <Picker
          selectedValue={selectedTime}
          style={styles.dropdown}
          onValueChange={(itemValue: React.SetStateAction<string>) => setSelectedTime(itemValue)}
        >
          <Picker.Item label="All Time" value="all" />
          <Picker.Item label="Last 1 Hour" value="last 1 hour" />
          <Picker.Item label="Last 24 Hours" value="last 24 hours" />
          <Picker.Item label="Last 1 Week" value="last 1 week" />
          <Picker.Item label="Last 1 Month" value="last 1 month" />
        </Picker>
      </View>

      <BarChart
        data={generateChartData()}
        width={chartWidth}
        height={chartHeight}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#f8f8f8',
          backgroundGradientTo: '#eaeaea',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          }
        }}
        style={styles.chart}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dropdownContainer: {
    width: '90%',
    marginBottom: 10,
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
});

export default StatisticsScreen;
