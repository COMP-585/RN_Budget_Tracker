import React from "react";
import { GestureResponderEvent, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  children?: React.ReactNode;
  onClose: () => void;
  primaryButtonLabel?: string;
  onPrimaryPress?: (event: GestureResponderEvent) => void;
};

export default function CustomModal({
  visible,
  title,
  children,
  onClose,
  primaryButtonLabel = "OK",
  onPrimaryPress,
}: Props) {
  const handlePrimaryPress = (e: GestureResponderEvent) => {
    if (onPrimaryPress) onPrimaryPress(e);
    else onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          {title ? <Text style={styles.title}>{title}</Text> : null}

          <View style={styles.content}>{children}</View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePrimaryPress} style={styles.buttonPrimary}>
              <Text style={styles.buttonPrimaryText}>{primaryButtonLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  content: {
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
  },
  buttonPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
