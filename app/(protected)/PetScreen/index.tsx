import CostumeCard from "@/components/costumeCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { costumes, type Costume } from "@/data/costumes";
import { staticPetBg, staticPets } from "@/data/staticAssets";
import { AppTheme, THEME } from "@/lib/theme";
import { ImageBackground } from "expo-image";
import { FlatList, Image, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function PetIndex() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const styles = style(theme);

  const itemProps = ({ item }: { item: Costume }) => (
    <CostumeCard item={item} theme={theme}></CostumeCard>
  );

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.background }}>
      <SafeAreaView style={[styles.primaryContainer]}>
        <ImageBackground source={staticPetBg} style={[styles.petContainer]}>
          <Image source={staticPets.catImg} style={[styles.petImage]} />
        </ImageBackground>

        <Card style={[styles.costumesContainer]}>
          <CardHeader>
            <CardTitle>Costumes</CardTitle>
            <CardDescription>
              <Separator />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FlatList
              data={costumes}
              renderItem={itemProps}
              horizontal
              contentContainerStyle={{ gap: 16 }}
              showsHorizontalScrollIndicator={false}
            />
          </CardContent>
        </Card>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const style = (theme: AppTheme) =>
  StyleSheet.create({
    primaryContainer: {
      flex: 1,
      margin: 16,
      gap: 16,
      justifyContent: "space-between",
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
      marginBottom: 8,
    },
    petContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundImage: staticPetBg,
    },
    costumesContainer: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 24,
      padding: 16,
    },
    accessoryItem: {
      alignItems: "center",
    },
    itemText: {
      fontSize: 12,
      color: theme.primary,
    },
  });
