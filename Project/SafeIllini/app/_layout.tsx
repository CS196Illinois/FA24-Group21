import { Stack, Tabs } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Tabs>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />      
      <Stack.Screen name="index" />
      <Stack.Screen name="report-incident" />
    </Tabs>
  );
}
