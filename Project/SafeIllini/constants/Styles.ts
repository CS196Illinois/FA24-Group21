import { StyleSheet } from "react-native"

export const addIncidentStyles = StyleSheet.create({
  container: {
    flex: 1, // take up all available space
    backgroundColor: '#f5f5f5' // sets the background color to light gray
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  locationDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  coords: {
    fontSize: 15,
    color: '#666'
  },
  dateTime: {
    fontSize: 15,
    color: '#666'
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff'
  },
  pickerDropDown: {
    height: 60
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16
  },
  buttonGroup: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    // marginTop: 10,
    gap: 12, // adds space between buttons
  },
  submitButton: {
    backgroundColor: '#4CAF50'
  }
})

// old styling for addIncident screen
// export const addIncidentStyles = {
//   container: {
//     flex: 1, // take up all available space
//     padding: 16 // adds some padding around the screen
//   },
//   descriptionContainer: {
//     backgroundColor: "000000",
//     height: 100,
//     width: '100%',
//     borderWidth: 1,
//     borderRadius: 8,
//     marginVertical: 10 // adds margin above and below the container
//   },
//   textInput: {
//     padding: 10, // adds padding around the text input on all sides
//     fontSize: 16 // sets the font size to 16
//   },
//   genericContainer: {
//     height: 50,
//     width: '100%',
//     borderWidth: 1,
//     borderRadius: 8,
//     marginVertical: 8
//   },
//   pickerContainer: {
//     width: '100%',
//     borderWidth: 1,
//     borderRadius: 8,
//     marginVertical: 8
//   },
//   pickerDropDown: {
//     width: '100%',
//     height: 60,
//     fontSize: 16,
//     padding: 10,
//   }
// }