import CustomModal from "@/components/ui/custommodal";
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export type GoalFormValues = {
  name: string;
  targetAmount: number;
  interval: string; // e.g. "Weekly", "Monthly"
  dueDate?: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: GoalFormValues) => void;
};

export default function GoalFormModal({ visible, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [interval, setInterval] = useState("");
  const [dueDate,setDueDate] = useState<Date | null>(null);
  const [isChecked, setChecked] = useState(false); // used for datepicker but I omitted it from this form.
  const [isNameValid, setIsNameValid] = useState(true);
  const [isTargetValid, setIsTargetValid] = useState(true);
  const [isIntervalValid, setIsIntervalValid] = useState(true);


  // Clear form when modal is closed
  useEffect(() => {
    if (!visible) {
      setName("");
      setTarget("");
      setInterval("");
      setChecked(false);
      setIsNameValid(true);
      setIsTargetValid(true);
      setIsIntervalValid(true);
    }
  }, [visible]);

  const handleSubmit = () => {
    const n = Number(target);

    const nameValid = name.trim().length > 0;
    const targetValid = Number.isFinite(n) && n > 0;
    const intervalValid = interval.trim().length > 0;

    setIsNameValid(nameValid);
    setIsTargetValid(targetValid);
    setIsIntervalValid(intervalValid);

    if (!nameValid || !targetValid || !intervalValid) {
      return;
    }

    onSubmit({
      name: name.trim(),
      targetAmount: n,
      interval: interval.trim(),
      dueDate: dueDate?.toISOString().split("T")[0],
    });

    onClose();
  };

  return (
    <CustomModal
      visible={visible}
      title="Create Goal"
      onClose={onClose}
      primaryButtonLabel="Create"
      onPrimaryPress={handleSubmit}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.field}>
          <View style={styles.rowContainer}>
            <Text style={styles.label}>Goal Name</Text>
            { !isNameValid && (
              <Text style={[styles.label, {color: "red"}]}>Please enter a valid name</Text>
            )}
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: New Laptop"
            returnKeyType="done"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.rowContainer}>
            <Text style={styles.label}>Goal Target ($)</Text>
            { !isTargetValid && (
              <Text style={[styles.label, {color: "red"}]}>Please enter a valid target</Text>
            )}
          </View>
          <TextInput
            value={target}
            onChangeText={setTarget}
            placeholder="Ex: 500"
            keyboardType="numeric"
            returnKeyType="done"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.rowContainer}>
            <Text style={styles.label}>Goal Interval</Text>
            { !isIntervalValid && (
              <Text style={[styles.label, {color: "red"}]}>Please enter a valid interval</Text>
            )}
          </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.intervalScroll}
            >
              {["daily", "weekly", "monthly", "biweekly", "bimonthly", "quarterly", "yearly"].map((option) => (
                  <TouchableOpacity
                      key={option}
                      onPress={() => setInterval(option)}
                      style={[ styles.intervalOption, interval === option && styles.intervalOptionSelected, ]}
                  >
                      <Text
                          style={[ styles.intervalText, interval === option && styles.intervalTextSelected, ]}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                  </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,

    },

intervalScroll: {
  flexDirection: "row",
  gap: 10,
  paddingVertical: 4,
},

intervalOption: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 12,
  paddingVertical: 8,
  paddingHorizontal: 16,
  marginRight: 4, // Needed for spacing in horizontal scroll
},

intervalOptionSelected: {
  backgroundColor: "#007AFF",
  borderColor: "#007AFF",
},

intervalText: {
  fontSize: 14,
  fontWeight: "500",
  color: "#333",
},

intervalTextSelected: {
  color: "#fff",
},
rowContainer: {
  flexDirection: "row",
  justifyContent: "space-between"
}

});
