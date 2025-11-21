import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { ScrollView, StyleSheet, useColorScheme, Image } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function PetIndex() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.primaryContainer}>
        <Text style={[styles.primaryText]}>Pet Screen</Text>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: 16 }}
        >
            <Image
              source={require("assets/images/cat.png")}
              style={[styles.petImage]}/>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
    margin: 16,
    gap: 16,
  },
  primaryText: {
    fontSize: 18,
    fontWeight: "600",
  },
  petImage: {
    width: 200,
    height: 200,
    resizeMode: "cover",
    alignSelf: "center",
  }
});
