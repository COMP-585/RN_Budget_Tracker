import "@/global.css";
import { NAV_THEME } from "@/lib/theme";
import { useAuth } from "@/lib/useAuth";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, loading } = useAuth();
  const isLoggedIn = user !== null;
  const { colorScheme, setColorScheme } = useColorScheme();
  setColorScheme("dark");

  // Listens when loading is true, then changes to splashscreen
  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);
  
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "dark"]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {/* gestureEnabled determines swiping back feature within Stack but can be individual */}
      <Stack screenOptions={{ gestureEnabled: false }}>
        <Stack.Protected guard={isLoggedIn && !loading}>
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}
