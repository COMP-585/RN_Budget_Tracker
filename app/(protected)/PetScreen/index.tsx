import CoinCounter from "@/components/coinCounter";
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
import {
  listenToUserProfile,
  unlockCostume,
  updateCostumeId,
  UserProfile,
} from "@/data/users";
import { AppTheme, THEME } from "@/lib/theme";
import { ImageBackground } from "expo-image";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function PetIndex() {
  const colorScheme = useColorScheme();
  const [selectedCostumeId, setSelectedCostumeId] = useState<number>(0);
  const [selectedPetImage, setSelectedPetImage] = useState<any>(
    staticPets.catImg
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const styles = style(theme);

  useEffect(() => {
    const unsubProfile = listenToUserProfile(setProfile);
    return () => {
      unsubProfile?.();
    };
  }, []);

  useEffect(() => {
    if (!profile) return;

    const currentPet = profile.currentPet ?? "cat";
    const currentCostumeId = profile.currentCostumeId ?? 0;

    setSelectedCostumeId(currentCostumeId);

    const costume = costumes.find((costume) => costume.id === currentCostumeId);

    if (costume && costume.name !== "None") {
      setSelectedPetImage(
        currentPet === "cat" ? costume.cat_costume : costume.dog_costume
      );
    } else {
      setSelectedPetImage(
        currentPet === "cat" ? staticPets.catImg : staticPets.dogImg
      );
    }
  }, [profile]);


  const handlePurchaseCostume = async (costume: Costume) => {
    if (!profile || (profile.coins ?? 0) < costume.price) {
      Alert.alert(
        "Not enough coins!",
        "You need more coins to buy this costume."
      );
      return;
    }

    try {
      await unlockCostume(costume, profile.coins ?? 0);
      Alert.alert(
        "Success!",
        `You have purchased the ${costume.name} costume.`
      );
    } catch (error: any) {
      Alert.alert(
        "Purchase Failed",
        error.message || "Could not complete the purchase."
      );
    }
  };

  const handleCardPress = async (item: Costume) => {
    const isUnlocked = profile?.unlockedCostumes?.includes(item.id) ?? false;
    const isNone = item.name === "None";

    if (isUnlocked || isNone) {
      await updateCostumeId(item.id);
    } else {
      // Locked costume
      if ((profile?.coins ?? 0) >= item.price) {
        Alert.alert(
          "Purchase Costume?",
          `Do you want to buy the ${item.name} costume for ${item.price} coins?`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Buy", onPress: () => handlePurchaseCostume(item) },
          ]
        );
      } else {
        Alert.alert(
          "Not Enough Coins",
          `You need ${item.price} coins to buy this costume. You only have ${profile?.coins ?? 0}.`
        );
      }
    }
  };

  const renderItem = ({ item }: { item: Costume }) => (
    <CostumeCard
      item={item}
      isNone={item.name === "None"}
      theme={theme}
      isSelected={item.id === selectedCostumeId}
      isUnlocked={profile?.unlockedCostumes?.includes(item.id) ?? false}
      onPress={() => handleCardPress(item)}
    />
  );

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.background }}>
      <SafeAreaView style={[styles.primaryContainer]}>
        <ImageBackground source={staticPetBg} style={[styles.petContainer]}>
          <CoinCounter
            profile={profile}
            theme={theme}
            style={styles.coinContainer}
            textColor={theme.background}
          ></CoinCounter>
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
    coinContainer: {
      position: "absolute",
      top: 10,
      right: 10,
    },
    primaryContainer: {
      flex: 1,
      justifyContent: "space-between",
      backgroundColor: theme.background,
    },
    primaryText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.primary,
    },
    petImage: {
      width: 400,
      height: 250,
      resizeMode: "cover",
      alignSelf: "center",
      position: "absolute",
      top: 250,
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
      margin: 16,
    },
  });
