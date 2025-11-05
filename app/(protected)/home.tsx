import { THEME } from "@/lib/theme";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

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
