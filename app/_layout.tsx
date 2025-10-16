import "@/global.css";
import { NAV_THEME } from "@/lib/theme";
import { useAuth } from "@/lib/useAuth";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React from "react";

export default function RootLayout() {
  const { user, loading } = useAuth();
  const isLoggedIn = user !== null;
  const { colorScheme, setColorScheme } = useColorScheme();
  setColorScheme("dark");

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "dark"]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack>
        <Stack.Protected guard={isLoggedIn && !loading}>
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={loading}></Stack.Protected>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}
