import { THEME } from "@/lib/theme";
import { Plus } from "lucide-react-native"; // optional icon, install if needed
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

export default function GoalsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const [goals, setGoals] = useState<{ id: string; title: string }[]>([]);

  const handleAddGoal = () => {
    const newGoal = {
      id: Date.now().toString(),
      title: `Goal #${goals.length + 1}`,
    };
    setGoals([...goals, newGoal]);
  };

  const renderGoal = ({ item }: { item: { id: string; title: string } }) => (
    <View
      style={[ styles.goalCard, { backgroundColor: theme.card, borderColor: theme.border } ]}>
      <Text style={[styles.goalText, { color: theme.foreground }]}>
        {item.title}
      </Text>
    </View>
  );

  return (
    <View style={[styles.primaryContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.primaryText, { color: theme.foreground }]}>
        Your Goals
      </Text>

      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.muted }]}>
            You don’t have any goals yet. Tap the + button to add one!
          </Text>
        </View>
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoal}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: theme.primary }]}
        onPress={handleAddGoal}
      >
        <Plus color={theme.primaryForeground} size={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
    padding: 20,
  },
  primaryText: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 120,
  },
  goalCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    elevation: 2,
  },
  goalText: {
    fontSize: 16,
    fontWeight: "500",
  },
    emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  plusText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: -3,
  },
});
