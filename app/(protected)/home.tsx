import { THEME } from "@/lib/theme";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { Button } from "@/components/ui/button";
import { auth } from "@/FirebaseConfig";
import { useAuth } from "@/lib/useAuth";
import { signOut } from "firebase/auth";

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  const { loading } = useAuth();

  const logout = async () => {
    if (loading) return;
    try {
      await signOut(auth);
      console.log("Logged out successfully!");
    } catch (error) {
      console.log("Error with logging out: " + error);
    }
  };

  return (
    <View style={styles.primaryContainer}>
        <Text style={[styles.primaryText, {color: theme.foreground}]}>
            Home Tab from app/protected/home.tsx
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
    primaryContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    primaryText: {
        fontSize: 18,
        fontWeight: "600",
    }
});


