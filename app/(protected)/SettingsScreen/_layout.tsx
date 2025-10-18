import { Stack } from "expo-router";
import React from "react";

export default function SettingsStackLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen
        name="index"
        options={{ title: "Account Settings" }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{ title: "Edit Profile" }}
      />
    </Stack>
  );
}
