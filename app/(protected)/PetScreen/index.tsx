import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { accessories, type Accessory } from "@/data/accessories";
import { THEME } from "@/lib/theme";
import {
  FlatList,
  Image,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
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
      marginBottom: 60,
    },
    petContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
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

  const itemProps = ({ item }: { item: Accessory }) => (
    <View style={styles.accessoryItem}>
      <Image source={item.image_path} style={styles.thumbImage} />
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>{item.price} pts</Text>
    </View>
  );

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
              <FlatList
                data={accessories}
                renderItem={itemProps}
                horizontal
                contentContainerStyle={{ gap: 16 }}
                showsHorizontalScrollIndicator={false}
              />
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
              <FlatList
                data={accessories}
                renderItem={itemProps}
                horizontal
                contentContainerStyle={{ gap: 16 }}
                showsHorizontalScrollIndicator={false}
              />
            </CardContent>
          </Card>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
