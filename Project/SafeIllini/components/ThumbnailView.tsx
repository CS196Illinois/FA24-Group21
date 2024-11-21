import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image, type ImageSource } from "expo-image";

type Props = {
    imgSource: string;
  };

export default function ThumbnailView({ imgSource }: Props) {
    return <Image source={imgSource} style={styles.image} />;
}

const styles = StyleSheet.create({
    image: {
      width: 100,
      height: 100,
    },
  });