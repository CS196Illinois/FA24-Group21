import { StyleSheet } from "react-native";
import { Image } from "expo-image";
import React from 'react';

type Props = {
    imgSource: string;
    selectedImage?: string;
};

export default function ImageViewer({ imgSource, selectedImage }: Props) {
    const imageSource = selectedImage ? { uri: selectedImage } : imgSource;

    return <Image source={imageSource} style={styles.image} />;
}

const styles = StyleSheet.create({
    image: {
        width: 320,
        height: 440,
        borderRadius: 18
    }
});