import React from "react";
import { ScrollView, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  selectedValue?: string | null;
  onChange: (value: string) => void;

  /** optional styling overrides */
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
  containerStyle,
  optionStyle,
  optionTextStyle,
  horizontal = false,
  maxHeight = 140,
}: Props) {
  return (
    <View style={[styles.wrapper, { maxHeight }, containerStyle]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        horizontal={horizontal}
      >
        {options.map((option) => {
          const isSelected = option.value === selectedValue;

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[ styles.option, isSelected && styles.optionSelected, optionStyle, ]}
            >
              <Text style={[ styles.optionText, isSelected && styles.optionTextSelected, optionTextStyle, ]}>
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
  wrapper: {
    borderRadius: 8,
    overflow: "hidden",
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
    marginInline: 10,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  optionSelected: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  optionTextSelected: {
    color: "#fff",
  },
});
