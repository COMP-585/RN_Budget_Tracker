import "@/global.css";
import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React from "react";

export default function ProtectedLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Tabs>
        <Tabs.Screen
          name="home"
          options={{ headerShown: false, title: "Home" }}
        />
        <Tabs.Screen
          name="GoalsScreen"
          options={{ headerShown: false, title: "Goals" }}
        />
        <Tabs.Screen
          name="SettingsScreen"
          options={{ headerShown: false, title: "Settings" }}
        />
      </Tabs>
      <PortalHost />
    </ThemeProvider>
  );
}
