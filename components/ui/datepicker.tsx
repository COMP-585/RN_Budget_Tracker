import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

type Props = {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  minYear?: number;
  maxYear?: number;
  label?: string;
  containerStyle?: ViewStyle;
};

const MONTHS = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
];

export default function DatePicker({
  value,
  onChange,
  minYear = new Date().getFullYear(),
  maxYear = new Date().getFullYear() + 30,
  containerStyle,
}: Props) {
  const initial = value ?? new Date();
  const [year, setYear] = useState<number | null>(initial.getFullYear());
  const [month, setMonth] = useState<number | null>(initial.getMonth() + 1);
  const [day, setDay] = useState<number | null>(initial.getDate());
  const [label, setLabel] = useState("mm/dd/yyyy");

  // Sync internal state if parent changes `value`
  useEffect(() => {
    if (!value) return;
    setYear(value.getFullYear());
    setMonth(value.getMonth() + 1);
    setDay(value.getDate());
    setLabel(`${month}/${day}/${year}`);
  }, [value]);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = minYear; y <= maxYear; y++) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  const daysInMonth = useMemo(() => {
    if (!year || !month) return 31;
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  // Whenever year/month/day combo is fully selected, emit a Date
  useEffect(() => {
    if (!year || !month || !day) {
      if (onChange) onChange(null);
      return;
    }
    const newDate = new Date(year, month - 1, day);
    if (onChange) onChange(newDate);
  }, [year, month, day, onChange]);

  // Handle month change (ensure day still valid)
  const handleMonthSelect = (mValue: number) => {
    setMonth(mValue);
    if (year && day) {
      const maxDay = new Date(year, mValue, 0).getDate();
      if (day > maxDay) {
        setDay(null);
      }
    }
  };

  return (
    <View style={[styles.field, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.dateColumns}>
        {/* Month column */}
        <View style={styles.dateColumn}>
          <Text style={styles.columnLabel}>Month</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.columnScrollContent}
          >
            {MONTHS.map((m) => (
              <TouchableOpacity
                key={m.value}
                onPress={() => handleMonthSelect(m.value)}
                style={[
                  styles.dateOption,
                  month === m.value && styles.dateOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dateOptionText,
                    month === m.value && styles.dateOptionTextSelected,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Day column */}
        <View style={styles.dateColumn}>
          <Text style={styles.columnLabel}>Day</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.columnScrollContent}
          >
            {days.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDay(d)}
                style={[
                  styles.dateOption,
                  day === d && styles.dateOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dateOptionText,
                    day === d && styles.dateOptionTextSelected,
                  ]}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Year column */}
        <View style={styles.dateColumn}>
          <Text style={styles.columnLabel}>Year</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.columnScrollContent}
          >
            {years.map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => setYear(y)}
                style={[
                  styles.dateOption,
                  year === y && styles.dateOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dateOptionText,
                    year === y && styles.dateOptionTextSelected,
                  ]}
                >
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  dateColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  dateColumn: {
    flex: 1,
    height: 160,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  columnLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
    color: "#555",
  },
  columnScrollContent: {
    paddingBottom: 8,
  },
  dateOption: {
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 2,
  },
  dateOptionSelected: {
    backgroundColor: "#007AFF",
  },
  dateOptionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  dateOptionTextSelected: {
    color: "#fff",
  },
});
