import "@/global.css";
import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { Home, Settings, Target } from "lucide-react-native";
import React from "react";
import Toast from  "react-native-toast-message"

export default function ProtectedLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Tabs>
        <Tabs.Screen
          name="home"
          options={{ headerShown: false, title: "Home",
                     tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,

           }}
        />
        <Tabs.Screen
          name="GoalsScreen"
          options={{ headerShown: false, title: "Goals",
                     tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,

           }}
        />
        <Tabs.Screen
          name="SettingsScreen"
          options={{ headerShown: false, title: "Settings",
                     tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,

           }}
        />
      </Tabs>
      <Toast position="top" topOffset={50} />
      <PortalHost />
    </ThemeProvider>
  );
}
