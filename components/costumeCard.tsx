import { type AppTheme } from "@/lib/theme";
import { type Costume } from "data/costumes";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function CostumeCard({
  item,
  theme,
}: {
  item: Costume;
  theme: AppTheme;
}) {
  const styles = style(theme);
  return (
    <TouchableOpacity style={styles.accessoryItem}>
      <Image
        source={item.image_path}
        style={styles.thumbImage}
        resizeMode="cover"
      />
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>{item.price}</Text>
    </TouchableOpacity>
  );
}

const style = (theme: any) =>
  StyleSheet.create({
    accessoryItem: {
      alignItems: "center",
    },
    thumbImage: {
      width: 50,
      height: 50,
      resizeMode: "cover",
    },
    itemText: {
      fontSize: 12,
      color: theme.primary,
    },
  });
