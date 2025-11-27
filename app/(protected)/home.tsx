import CurrencyIcon from "@/assets/images/currency.png";
import Header from "@/components/ui/header";
import { listenToUserProfile, UserProfile } from "@/data/users";
import { THEME } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
      const unsub = listenToUserProfile((data) => {
        setProfile(data);
      });
      return unsub;
    }, []);

  return (
    <SafeAreaView style={[styles.primaryContainer, { backgroundColor: theme.background }]}>
      <Header 
        title="Pet"
        rightComponent={
          <View style={[styles.coinsContainer]}>
            <Text style={[styles.meta, { color: theme.foreground, padding: 6}]}>{profile?.coins?? 0}</Text>
            <Image
              source={CurrencyIcon}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  primaryContainer: { 
    flex: 1, 
    padding: 20 

  },
  coinsContainer: {
    flex: 1,
    flexDirection: 'row',

  },
  meta: { 
    fontSize: 13, 
    fontWeight: "500" 

  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 

  },
  emptyText: { 
    fontSize: 16, 
    textAlign: "center" 

  },
});
