import { listenToUserProfile, UserProfile } from "@/data/users";
import "@/global.css";
import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Cat, Dog, Goal, Settings } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";

export default function ProtectedLayout() {
  const { colorScheme } = useColorScheme();
  const [selectedPet, setSelectedPet] = useState<string>("cat");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubProfile = listenToUserProfile(setProfile);
    return () => {
      unsubProfile?.();
    };
  }, []);

  useEffect(() => {
    if (!profile) return;

    const currentPet = profile.currentPet ?? "cat";
    setSelectedPet(currentPet);
  }, [profile]);

  return (
    <ThemeProvider value={NAV_THEME[colorScheme === "dark" ? "dark" : "light"]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Tabs>
        <Tabs.Screen
          name="GoalsScreen"
          options={{
            headerShown: false,
            title: "Goals",
            tabBarIcon: ({ color }) => <Goal color={color}></Goal>,
          }}
        />
        <Tabs.Screen
          name="PetScreen"
          options={{
            headerShown: false,
            title: "Pet",
            tabBarIcon: ({ color }) => {
              return selectedPet === "cat" ? (
                <Cat color={color}></Cat>
              ) : (
                <Dog color={color}></Dog>
              );
            },
          }}
        />
        <Tabs.Screen
          name="SettingsScreen"
          options={{
            headerShown: false,
            title: "Settings",
            tabBarIcon: ({ color }) => <Settings color={color}></Settings>,
          }}
        />
      </Tabs>
      <PortalHost />
    </ThemeProvider>
  );
}
