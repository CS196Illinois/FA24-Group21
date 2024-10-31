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
        backgroundColor: "#FF1199",
        alignItems: 'center',
        height: 50,
        width: 60,
        marginHorizontal: '50%',
        marginVertical: 10
    },
    button: {
        backgroundColor: "#000099",
        alignItems: "center",
        borderRadius: 10,
        width: '90%',
        height: '90%'

    },
    buttonLabel: {
        // backgroundColor: "",
        color: "#FFFFFF"
    }
});