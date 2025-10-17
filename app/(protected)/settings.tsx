import { auth } from "@/FirebaseConfig";
import { THEME } from "@/lib/theme";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
      router.replace("/"); // redirects to login and removes route history
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.primaryText, { color: theme.foreground }]}>
        Settings
      </Text>

      <TouchableOpacity
        onPress={handleSignOut}
        style={[styles.button, { backgroundColor: theme.foreground }]}
      >
        <Text style={[styles.buttonText, { color: theme.background }]}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  primaryText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
