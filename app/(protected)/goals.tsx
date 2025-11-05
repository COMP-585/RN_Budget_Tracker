import { addContribution, createGoal, deleteGoal, listenGoals, updateGoal } from "@/data/goals";
import { THEME } from "@/lib/theme";
import { Edit3, Plus, Trash2 } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate?: string | null;
  color?: string | null;
};

export default function GoalsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsub = listenGoals((rows: Goal[]) => setGoals(rows || []));
    return () => unsub?.();
  }, []);

  const handleAddGoal = () => {
    createGoal({
      name: "New Goal",
      targetAmount: 100,
      currentAmount: 0,
      dueDate: "2025-12-25",
    });
  };

  const openDetails = (id: string) => {
    setSelectedId(id);
    setOpen(true);
  };
  const closeDetails = () => {
    setOpen(false);
    setSelectedId(null);
  };

  const selectedGoal = useMemo(
    () => goals.find((g) => g.id === selectedId) || null,
    [goals, selectedId]
  );

  const renderGoal = ({ item }: { item: Goal }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => openDetails(item.id)}
      style={[styles.goalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.goalText, { color: theme.foreground }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.meta, { color: "white" }]}>
          ${item.currentAmount.toFixed(0)} / ${item.targetAmount.toFixed(0)}
        </Text>
      </View>

      <ProgressBar
        trackColor={theme.muted || theme.border}
        fillColor={item.color || theme.primary}
        progress={safePct(item.currentAmount / Math.max(1, item.targetAmount))}
      />

      <View style={styles.cardFooter}>
        <Text style={[styles.meta, { color: "white" }]}>
          {Math.round(safePct(item.currentAmount / Math.max(1, item.targetAmount)) * 100)}%
        </Text>
        <Text style={[styles.meta, { color: "white" }]}>
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
          <Text style={[styles.emptyText, { color: "white" }]}>
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

      {/* Click-through UI */}
      <GoalDetailsModal
        visible={open}
        theme={theme}
        goal={selectedGoal}
        onClose={closeDetails}
        onRename={async (name) => selectedGoal && updateGoal(selectedGoal.id, { name })}
        onUpdateTarget={async (targetAmount) =>
          selectedGoal && updateGoal(selectedGoal.id, { targetAmount })
        }
        onAddContribution={async (amount) =>
        selectedGoal && addContribution(selectedGoal.id, amount)
        }
        onDelete={async () =>
          selectedGoal &&
          Alert.alert("Delete goal?", `This will remove “${selectedGoal.name}”.`, [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => deleteGoal(selectedGoal.id).then(closeDetails),
            },
          ])
        }
      />
    </SafeAreaView>
  );
}

/* ------------ Components ------------ */

function safePct(n: number) {
  return Math.max(0, Math.min(1, n));
}

function ProgressBar({
  progress,
  trackColor,
  fillColor,
}: {
  progress: number;
  trackColor: string;
  fillColor: string;
}) {
  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${safePct(progress) * 100}%`, backgroundColor: fillColor },
        ]}
      />
    </View>
  );
}

function GoalDetailsModal({
  visible,
  theme,
  goal,
  onClose,
  onRename,
  onUpdateTarget,
  onAddContribution,
  onDelete,
}: {
  visible: boolean;
  theme: any;
  goal: Goal | null;
  onClose: () => void;
  onRename: (name: string) => void;
  onUpdateTarget: (targetAmount: number) => void;
  onAddContribution: (amount: number) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(goal?.name ?? "");
  const [targetStr, setTargetStr] = useState(goal ? String(goal.targetAmount) : "");
  const [contribStr, setContribStr] = useState("50");

  React.useEffect(() => {
    setName(goal?.name ?? "");
    setTargetStr(goal ? String(goal.targetAmount) : "");
    setContribStr("50");
  }, [goal?.id]);

  if (!goal) return null;

  const pct = safePct(goal.currentAmount / Math.max(1, goal.targetAmount));
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[styles.modalSheet, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.foreground }]} numberOfLines={2}>
              {goal.name}
            </Text>
            <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
              <Trash2 size={20} color={theme.destructive || "#ef4444"} />
            </TouchableOpacity>
          </View>

          {/* Summary */}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryText, { color: "white" }]}>
              Saved: ${goal.currentAmount.toFixed(0)}
            </Text>
            <Text style={[styles.summaryText, { color: "white" }]}>
              Target: ${goal.targetAmount.toFixed(0)}
            </Text>
          </View>
          <ProgressBar
            progress={pct}
            trackColor={theme.mutedBg || theme.border}
            fillColor={goal.color || theme.primary}
          />
          <Text style={[styles.remainingText, { color: "white" }]}>
            Remaining: ${remaining.toFixed(0)} • {Math.round(pct * 100)}%
          </Text>

          {/* Rename */}
          <View style={styles.fieldRow}>
            <Edit3 size={16} color={"white"} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Rename goal"
              placeholderTextColor={theme.muted}
              style={[
                styles.input,
                {
                  color: theme.foreground,
                  borderColor: theme.border,
                  backgroundColor: theme.inputBg || theme.background,
                },
              ]}
            />
            <TouchableOpacity
              onPress={() => name.trim() && onRename(name.trim())}
              style={[styles.smallBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.smallBtnText, { color: theme.primaryForeground }]}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Target */}
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: "white" }]}>Target $</Text>
            <TextInput
              value={targetStr}
              onChangeText={setTargetStr}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={"white"}
              style={[
                styles.input,
                {
                  color: theme.foreground,
                  borderColor: theme.border,
                  backgroundColor: theme.inputBg || theme.background,
                },
              ]}
            />
            <TouchableOpacity
              onPress={() => {
                const t = Number(targetStr);
                if (!Number.isFinite(t) || t <= 0) return Alert.alert("Enter a valid target.");
                onUpdateTarget(Math.round(t));
              }}
              style={[styles.smallBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.smallBtnText, { color: theme.primaryForeground }]}>Update</Text>
            </TouchableOpacity>
          </View>

          {/* Contribution */}
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: "white" }]}>Add $</Text>
            <TextInput
              value={contribStr}
              onChangeText={setContribStr}
              keyboardType="numeric"
              placeholder="Amount"
              placeholderTextColor={"white"}
              style={[
                styles.input,
                {
                  color: theme.foreground,
                  borderColor: theme.border,
                  backgroundColor: theme.inputBg || theme.background,
                },
              ]}
            />
            <TouchableOpacity
              onPress={() => {
                const n = Number(contribStr);
                if (!Number.isFinite(n) || n <= 0)
                  return Alert.alert("Enter a positive number.");
                onAddContribution(Math.round(n));
                setContribStr("");
              }}
              style={[styles.smallBtn, { backgroundColor: theme.success || "#22c55e" }]}
            >
              <Text style={[styles.smallBtnText, { color: theme.successFg || "#052e16" }]}>
                Add
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: theme.border }]}>
            <Text style={[styles.closeText, { color: theme.foreground }]}>Close</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/* ------------ Styles ------------ */

const styles = StyleSheet.create({
  primaryContainer: { flex: 1, padding: 20 },
  primaryText: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  listContainer: { paddingBottom: 120 },

  goalCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
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

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, borderWidth: 1 },
  modalHandle: { alignSelf: "center", width: 44, height: 5, borderRadius: 999, backgroundColor: "rgba(127,127,127,0.35)", marginBottom: 8 },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "space-between", marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: "800", flex: 1, paddingRight: 8 },
  iconBtn: { padding: 8, borderRadius: 10 },

  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryText: { fontSize: 14, fontWeight: "600" },
  remainingText: { fontSize: 13, marginTop: 8, marginBottom: 8 },

  fieldRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  fieldLabel: { width: 62, fontSize: 14, fontWeight: "600" },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  smallBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  smallBtnText: { fontWeight: "800", fontSize: 13 },

  closeBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  closeText: { fontWeight: "700", fontSize: 16 },
});
