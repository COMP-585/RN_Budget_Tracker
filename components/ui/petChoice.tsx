import { Text } from "@/components/ui/text";
import { AppTheme } from "@/lib/theme";
import { Cat, Dog } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

type PetChoiceProps = {
  onPress: () => void;
  isCat: boolean;
  theme: AppTheme;
};

export default function PetChoice({ onPress, isCat, theme }: PetChoiceProps) {
  const style = styles(theme);

  return (
    <View style={style.toggleContainer}>
      <Pressable
        style={[style.choiceContainer, isCat && style.selected]}
        onPress={onPress}
        disabled={isCat}
      >
        <Cat color={isCat ? theme.background : theme.foreground} />
        <Text style={isCat ? style.selectedText : { color: theme.foreground }}>
          Cat
        </Text>
      </Pressable>

      <Pressable
        style={[style.choiceContainer, !isCat && style.selected]}
        onPress={onPress}
        disabled={!isCat}
      >
        <Dog color={!isCat ? theme.background : theme.foreground} />
        <Text style={!isCat ? style.selectedText : { color: theme.foreground }}>
          Dog
        </Text>
      </Pressable>
    </View>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    toggleContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderColor: theme.foreground,
      borderWidth: 1,
      borderRadius: 24,
    },
    choiceContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
      gap: 8,
    },
    selectedText: {
      color: theme.background,
    },
    selected: {
      backgroundColor: theme.foreground,
      borderRadius: 24,
    },
  });
