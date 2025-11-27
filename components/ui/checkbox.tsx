import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  size?: number;
};

export default function Checkbox({ checked, onChange, size = 24 }: Props) {
  return (
    <TouchableOpacity
      onPress={() => onChange(!checked)}
      style={[
        styles.box,
        { width: size, height: size },
        checked && styles.checkedBox,
      ]}
      activeOpacity={0.7}
    >
      {checked && (
        <Ionicons
          name="checkmark"
          size={size * 0.75}
          color="#fff"
          style={{ marginLeft: 1 }}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    borderColor: "#555",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
});
