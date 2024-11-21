import React from 'react';
import { StyleSheet, View, Pressable, Text, ViewStyle } from 'react-native';

type Props = {
  label: string,
  onPress?: () => void;
  style?: ViewStyle; // adding a custom style prop
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

export default function Button({
  label,
  onPress,
  style,
  variant = 'primary',
  disabled = false
}: Props) {
  return (
    <View style={[styles.buttonContainer]}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles[variant],
          pressed && styles.pressed,
          disabled && styles.disabled,
          style
        ]}
        onPress={onPress}
        disabled={disabled}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
      >
        <Text style={[styles.buttonLabel, disabled && styles.disabledText]}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}


const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    height: 48,
    marginVertical: 8,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#6c757d',
  },
  danger: {
    backgroundColor: '#dc3545',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: '#cccccc',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledText: {
    color: '#999999',
  },
});

// old styling for button
// const styles = StyleSheet.create({
//   buttonContainer: {
//     backgroundColor: "#FF1199",
//     alignItems: 'center',
//     height: 50,
//     width: 100,
//     marginHorizontal: '50%',
//     marginVertical: 10,
//     borderRadius: 10
//   },
//   button: {
//     backgroundColor: "#000099",
//     alignItems: "center",
//     borderRadius: 10,
//     // width: '90%',
//     // height: '90%',
//     marginVertical: '2%',
//     flex: 1,
//     marginHorizontal: 8
//   },
//   buttonLabel: {
//     color: "#FFFFFF"
//   }
// });