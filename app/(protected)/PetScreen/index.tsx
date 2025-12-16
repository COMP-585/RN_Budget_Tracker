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
import { useState } from "react";
import { FlatList, Image, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function PetIndex() {
  const colorScheme = useColorScheme();
  const [selectedCostumeId, setSelectedCostumeId] = useState<string | null>(
    null
  );
  const [selectedPetImage, setSelectedPetImage] = useState<any>(
    staticPets.catImg
  );
  const [selectedPet, setSelectedPet] = useState<string>("cat");

  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const styles = style(theme);

  const renderItem = ({ item }: { item: Costume }) => (
    <CostumeCard
      item={item}
      isNone={item.name === "None"}
      theme={theme}
      isSelected={
        item.name === "None"
          ? selectedCostumeId === null
          : item.name === selectedCostumeId
      }
      onPress={() => {
        setSelectedCostumeId(item.name === "None" ? null : item.name);
        setSelectedPetImage(
          selectedPet === "cat" ? item.cat_costume : item.dog_costume
        );
      }}
    />
  );

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.background }}>
      <SafeAreaView style={[styles.primaryContainer]}>
        <ImageBackground source={staticPetBg} style={[styles.petContainer]}>
          <Image source={selectedPetImage} style={[styles.petImage]} />
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
              renderItem={renderItem}
              horizontal
              contentContainerStyle={{ gap: 16 }}
              showsHorizontalScrollIndicator={false}
              extraData={selectedCostumeId}
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
  });
