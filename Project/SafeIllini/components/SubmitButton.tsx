import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';

type Props = {
    label: string,
    onPress?: () => void;
};

export default function SubmitButton({ label, onPress }: Props) {
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
        height: 67,
        width: '100%',
        padding: 2,
        borderRadius: 10,
    },
    button: {
        backgroundColor: "#000099",
        borderRadius: 10,
        width: '100%',
        height: 130,
        justifyContent: 'center',
    },
    buttonLabel: {
        color: "#FFFFFF",
        alignSelf: 'center'
    }
});