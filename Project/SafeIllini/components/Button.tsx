import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';

type Props = {
    label: string,
    onPress?: () => void;
};

export default function Button({ label, onPress }: Props) {
    return (
        <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={onPress}>
                <Text style={styles.buttonLabel}> {label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        height: 55,
        width: '100%',
        justifyContent: 'center',
        padding: 3,
        borderRadius: 10,
    },
    button: {
        backgroundColor: "#000099",
        alignItems: "center",
        borderRadius: 10,
        width: '100%',
        height: '100%',
        justifyContent: 'center'
    },
    buttonLabel: {
        color: "#FFFFFF"
    }
});