import { Stack } from "expo-router";
import React from "react";

export default function SettingsStackLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="goal-options"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
