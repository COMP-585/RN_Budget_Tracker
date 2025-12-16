import { type AppTheme } from "@/lib/theme";
import { type Costume } from "data/costumes";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function CostumeCard({
  item,
  theme,
  isSelected,
  isNone,
  onPress,
}: {
  item: Costume;
  theme: AppTheme;
  isSelected: boolean;
  onPress: () => void;
  isNone?: boolean;
}) {
  const styles = style(theme, isSelected);
  return (
    <TouchableOpacity style={styles.accessoryItem} onPress={onPress}>
      <Image
        source={item.image_path}
        style={styles.thumbImage}
        resizeMode="cover"
      />
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>{isNone ? "" : item.price}</Text>
    </TouchableOpacity>
  );
}

const style = (theme: AppTheme, isSelected: boolean) =>
  StyleSheet.create({
    accessoryItem: {
      alignItems: "center",
      padding: 8,
      borderRadius: 8,
      borderWidth: 2,
      minWidth: 66, // to match width of other cards
      borderColor: isSelected ? theme.primary : "transparent",
    },
    thumbImage: {
      width: 50,
      height: 50,
    },
    itemText: {
      fontSize: 12,
      color: theme.primary,
    },
  });
