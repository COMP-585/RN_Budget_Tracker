import { type AppTheme } from "@/lib/theme";
import { type Costume } from "data/costumes";
import { Lock } from "lucide-react-native";
import React from "react";
import { Text } from "@/components/ui/text";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function CostumeCard({
  item,
  theme,
  isSelected,
  isNone,
  isUnlocked,
  onPress,
}: {
  item: Costume;
  theme: AppTheme;
  isSelected: boolean;
  onPress: () => void;
  isNone?: boolean;
  isUnlocked?: boolean;
}) {
  const unlocked = isUnlocked || isNone;
  const styles = style(theme, isSelected, unlocked ?? false);

  return (
    <TouchableOpacity
      style={styles.accessoryItem}
      onPress={onPress}
      disabled={!unlocked && isSelected}
    >
      <View>
        <Image
          source={item.image_path}
          style={styles.thumbImage}
          resizeMode="cover"
        />
        {!unlocked && (
          <View style={styles.lockOverlay}>
            <Lock color="white" size={24} />
          </View>
        )}
      </View>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>
        {isNone || unlocked ? "" : item.price}
      </Text>
    </TouchableOpacity>
  );
}

const style = (theme: AppTheme, isSelected: boolean, isUnlocked: boolean) =>
  StyleSheet.create({
    accessoryItem: {
      alignItems: "center",
      padding: 8,
      borderRadius: 8,
      borderWidth: 2,
      minWidth: 66,
      borderColor: isSelected
        ? theme.primary
        : !isUnlocked
          ? theme.chart5
          : "transparent",
    },
    thumbImage: {
      width: 50,
      height: 50,
      opacity: isUnlocked ? 1 : 0.4,
    },
    itemText: {
      fontSize: 12,
      color: theme.primary,
    },
    lockOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
    },
  });
