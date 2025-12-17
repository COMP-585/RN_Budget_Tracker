import { Stack } from "expo-router";
import React from "react";

export default function SettingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="edit-profile"
        options={{ headerShown: true, title: "Edit Profile" }}
      />
    </Stack>
  );
}
