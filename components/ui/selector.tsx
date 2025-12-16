import React from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  selectedValue?: string | null;
  onChange: (value: string) => void;

  size?: "sm" | "md" | "lg"; // NEW

  containerStyle?: StyleProp<ViewStyle>;
  optionStyle?: StyleProp<ViewStyle>;
  optionTextStyle?: StyleProp<TextStyle>;
  horizontal?: boolean;
  maxHeight?: number; // default: 140
};

export default function Selector({
  options,
  selectedValue,
  onChange,
  size = "md",        // DEFAULT SIZE
  containerStyle,
  optionStyle,
  optionTextStyle,
  horizontal = false,
  maxHeight = 140,
}: Props) {
  // Define size presets
  const sizePresets = {
    sm: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      textSize: 12,
      borderRadius: 8,
      marginHorizontal: 6,
    },
    md: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      textSize: 16,
      borderRadius: 8,
      marginHorizontal: 10,
    },
    lg: {
      paddingVertical: 14,
      paddingHorizontal: 18,
      textSize: 18,
      borderRadius: 10,
      marginHorizontal: 12,
    },
  };

  const sz = sizePresets[size];

  return (
    <View style={[styles.wrapper, { maxHeight }, containerStyle]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
      >
        {options.map((option) => {
          const isSelected = option.value === selectedValue;

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                {
                  paddingVertical: sz.paddingVertical,
                  paddingHorizontal: sz.paddingHorizontal,
                  borderRadius: sz.borderRadius,
                  marginHorizontal: sz.marginHorizontal,
                },
                isSelected && styles.optionSelected,
                optionStyle,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { fontSize: sz.textSize },
                  isSelected && styles.optionTextSelected,
                  optionTextStyle,
                ]}
              >
                {option.label.charAt(0).toUpperCase() + option.label.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 8, overflow: "hidden" },
  scroll: { flexGrow: 0 },
  scrollContent: { paddingVertical: 8 },
  option: {
    backgroundColor: "#eee",
  },
  optionSelected: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    fontWeight: "500",
    color: "#333",
  },
  optionTextSelected: {
    color: "#fff",
  },
});
