import { createGoal, listenGoals } from "@/data/goals";
import { THEME } from "@/lib/theme";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate?: string | null;
  color?: string | null;
};

export default function GoalsIndex() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const [goals, setGoals] = useState<Goal[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = listenGoals((rows: Goal[]) => setGoals(rows || []));
    return () => unsub?.();
  }, []);

  const handleAddGoal = async () => {
    await createGoal({
      name: "New Goal",
      targetAmount: 100,
      currentAmount: 0,
      dueDate: "2025-12-25",
    });
  };

  const renderGoal = ({ item }: { item: Goal }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      // Navigate to the stack screen with an id param
      onPress={() =>
        router.push({
          pathname: "/GoalsScreen/goal-details",
          params: { id: item.id },
        })
      }
      style={[styles.goalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.goalText, { color: theme.foreground }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          ${item.currentAmount.toFixed(0)} / ${item.targetAmount.toFixed(0)}
        </Text>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: theme.muted || theme.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(100, Math.max(0, (item.currentAmount / Math.max(1, item.targetAmount)) * 100))}%`,
              backgroundColor: item.color || theme.primary,
            },
          ]}
        />
      </View>

      <View style={styles.cardFooter}>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {Math.round((item.currentAmount / Math.max(1, item.targetAmount)) * 100)}%
        </Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          Remaining: ${Math.max(0, item.targetAmount - item.currentAmount).toFixed(0)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.primaryContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.primaryText, { color: theme.foreground }]}>Your Goals</Text>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  primaryContainer: { flex: 1, padding: 20 },
  primaryText: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  listContainer: { paddingBottom: 120 },
  goalCard: {
    borderWidth: 1, borderRadius: 12, padding: 16, marginVertical: 8,
    elevation: 2, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  goalText: { fontSize: 16, fontWeight: "700", flex: 1, marginRight: 8 },
  meta: { fontSize: 13, fontWeight: "500" },
  progressTrack: { height: 10, borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  cardFooter: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, textAlign: "center" },
  floatingButton: {
    position: "absolute", bottom: 30, right: 30, width: 60, height: 60,
    borderRadius: 30, alignItems: "center", justifyContent: "center", elevation: 6,
  },
});
