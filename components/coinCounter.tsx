import CurrencyIcon from "@/assets/images/currency.png";
import { UserProfile } from "@/data/users";
import { AppTheme } from "@/lib/theme";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

type CoinCounterProps = {
  profile: UserProfile | null;
  theme: AppTheme;
  style?: ViewStyle;
  textColor?: string;
};

export default function CoinCounter({
  profile,
  theme,
  style,
  textColor,
}: CoinCounterProps) {
  return (
    <View style={[styles.coinsContainer, style]}>
      <Text style={[styles.meta, { color: textColor ?? theme.foreground, padding: 6 }]}>
        {profile?.coins ?? 0}
      </Text>
      <Image source={CurrencyIcon} style={{ width: 28, height: 28 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  coinsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  meta: {
    fontSize: 16,
    fontWeight: "500",
  },
});
