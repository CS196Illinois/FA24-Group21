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
    elevation: 3,
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
    color: '#666',
    marginRight: '37%'
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
  },
  smallButton: {
    width: 80
  }
  ,
  displayPhotos: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    minHeight: 50,
    padding: 'auto',
    flexWrap: 'wrap'
  }
})