//update the labels to the standard labels, and severity. plus fix the styling
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
  const [severityOpen, setSeverityOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

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
    const types = ['harassment','sexual_harassment', 'drunk_driving', 'theft', 'high_noise', 'assault', 'other'];
    const data = types.map(
      (type) => filteredData.filter((incident) => incident.type === type).length
    );

    return {
      labels: ['Harassment','Sexual Harassment', 'Drunk Driving', 'Theft', 'High Noise', 'Assault', 'Other'],
      datasets: [
        {
          data,
        },
      ],
    };
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={true}
      scrollEnabled={true}
    >
      <Text style={styles.title}>Incident Statistics</Text>

      <View style={styles.dropdownContainerS}>
  <Text style={styles.dropdownLabel}>Severity:</Text>
  <TouchableOpacity 
    style={styles.dropdownButton}
    onPress={() => setSeverityOpen(!severityOpen)}
  >
    <Text style={styles.dropdownButtonText}>{selectedSeverity}</Text>
  </TouchableOpacity>
  {severityOpen && (
    <View style={styles.dropdownListS}>
      <TouchableOpacity onPress={() => {setSelectedSeverity('all'); setSeverityOpen(false)}}>
        <Text style={styles.dropdownItem}>All</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {setSelectedSeverity('low'); setSeverityOpen(false)}}>
        <Text style={styles.dropdownItem}>Low</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {setSelectedSeverity('medium'); setSeverityOpen(false)}}>
        <Text style={styles.dropdownItem}>Medium</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {setSelectedSeverity('high'); setSeverityOpen(false)}}>
        <Text style={styles.dropdownItem}>High</Text>
      </TouchableOpacity>
    </View>
  )}

<View style={styles.dropdownContainer}>
  <Text style={styles.dropdownLabel}>Time:</Text>
  <TouchableOpacity 
    style={styles.dropdownButton}
    onPress={() => setTimeOpen(!timeOpen)}
  >
    <Text style={styles.dropdownButtonText}>{selectedTime}</Text>
  </TouchableOpacity>
  {timeOpen && (
    <View style={styles.dropdownList}>
      <TouchableOpacity onPress={() => {setSelectedTime('all'); setTimeOpen(false)}}>
        <Text style={styles.dropdownItem}>All Time</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {setSelectedTime('last 1 hour'); setTimeOpen(false)}}>
        <Text style={styles.dropdownItem}>Last 1 Hour</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {setSelectedTime('last 24 hours'); setTimeOpen(false)}}>
        <Text style={styles.dropdownItem}>Last 24 Hours</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {setSelectedTime('last 1 week'); setTimeOpen(false)}}>
        <Text style={styles.dropdownItem}>Last 1 Week</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {setSelectedTime('last 1 month'); setTimeOpen(false)}}>
        <Text style={styles.dropdownItem}>Last 1 Month</Text>
      </TouchableOpacity>
    </View>
  )}
</View>
</View>
      <ScrollView   horizontal={true} 
  showsHorizontalScrollIndicator={true}
  style={styles.chartScrollContainer}
  contentContainerStyle={styles.chartContentContainer}
  > 
        <BarChart
          data={generateChartData()}
          width={chartWidth}
          height={chartHeight}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(128, 90, 213, ${opacity})`, // Purple color for bars
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            barPercentage: 0.8,
            
            propsForBackgroundLines: {
              strokeWidth: 1,
              strokeDasharray: '',
              stroke: '#E2E8F0'
            },
            propsForLabels: {
              fontSize: 12,
            },
            propsForVerticalLabels: {
              rotation: 45
            } 

          }}
          fromZero
          fromNumber={Math.max(...generateChartData().datasets[0].data) > 4 ? 
            Math.max(...generateChartData().datasets[0].data) : 4}
          showValuesOnTopOfBars
          flatColor
          withInnerLines={false}
          segments={4}
          style={styles.chart}
        />
        </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
    color: '#1A202C',
    alignSelf: 'flex-start'
  },
  dropdownContainer: {
    width: '90%',
    marginBottom: 10,
    zIndex: 2000, 
    elevation: 2000, 
    position: 'relative', 
  },
  dropdownContainerS: {
    width: '90%',
    marginBottom: 10,
    zIndex: 3000, 
    elevation: 3000, 
    position: 'relative', 
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#4A5568'
  },
  dropdownButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#2D3748',
    textTransform: 'capitalize'
  },
  dropdownList: {
    position: 'absolute',
    top: 84,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    zIndex: 2000, 
    elevation: 2000, 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12
  },
  dropdownListS: {
    position: 'absolute',
    top: 84,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    zIndex: 3000, 
    elevation: 3000, 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    color: '#4A5568'
  },
  chartScrollContainer: {
    marginVertical: 10,
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingBottom: 12,
    zIndex: 1
  },
  chartContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20, 
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 20,
  }
});

export default StatisticsScreen;