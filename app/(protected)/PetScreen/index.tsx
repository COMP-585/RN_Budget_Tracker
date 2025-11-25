import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { Image, StyleSheet, useColorScheme, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function PetIndex() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const styles = StyleSheet.create({
    primaryContainer: {
      flex: 1,
      margin: 16,
      gap: 16,
      backgroundColor: theme.background,
    },
    primaryText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.primary,
    },
    petImage: {
      width: 200,
      height: 200,
      resizeMode: "cover",
      alignSelf: "center",
    },
    thumbImage: {
      width: 50,
      height: 50,
      resizeMode: "cover",
    },
    optionsContainer: {
      flex: 1,
      flexDirection: "column",
      gap: 16,
    },
    petContainer: {
      flex: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    costumesContainer: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 24,
      padding: 16,
    },
  });

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.background }}>
      <SafeAreaView style={[styles.primaryContainer]}>
        <View style={[styles.petContainer]}>
          <Image
            source={require("assets/images/cat.png")}
            style={[styles.petImage]}
          />
        </View>
        <View style={[styles.optionsContainer]}>
          <Card style={[styles.costumesContainer]}>
            <CardHeader>
              <CardTitle>Costumes</CardTitle>
              <CardDescription>
                <Separator />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text>Coming Soon!</Text>
            </CardContent>
          </Card>

          <Card style={[styles.costumesContainer]}>
            <CardHeader>
              <CardTitle>Accessories</CardTitle>
              <CardDescription>
                <Separator />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text>Coming Soon!</Text>
            </CardContent>
          </Card>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
