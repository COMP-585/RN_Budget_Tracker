import { addContribution, deleteGoal, updateGoal } from "@/data/goals";
import { auth, db } from "@/FirebaseConfig";
import { THEME } from "@/lib/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate?: string | null;
  color?: string | null;
};

export default function GoalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [name, setName] = useState("");
  const [targetStr, setTargetStr] = useState("");
  const [contribStr, setContribStr] = useState("");

  // Guard against missing id
  useEffect(() => {
    if (!id) router.back();
  }, [id]);

  // Live subscribe to goal
useEffect(() => {
  if (!id) return;
  const uid = auth.currentUser?.uid;
  if (!uid) return; // handle logged-out case
  const ref = doc(db, "users", uid, "goals", String(id));
  const unsub = onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() } as Goal;
      setGoal(data);
      setName(goal?.name ?? "");
      setTargetStr(goal?.targetAmount ? String(goal.targetAmount) : "");
    } else {
      setGoal(null);
    }
  });
  return () => unsub();
}, [id]);

  if (!goal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: theme.muted }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pct = Math.max(0, Math.min(1, goal.currentAmount / Math.max(1, goal.targetAmount)));
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                <Text style={{ color: theme.muted, fontWeight: "700" }}>Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.foreground }]} numberOfLines={1}>
                {goal.name}
                </Text>
                <TouchableOpacity
                onPress={() => {
                    Alert.alert("Delete goal?", `This will remove “${goal.name}”.`, [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                        await deleteGoal(goal.id);
                        router.back();
                        },
                    },
                    ]);
                }}
                style={styles.headerBtn}
                >
                <Text style={{ color: theme.destructive || "#ef4444", fontWeight: "700" }}>Delete</Text>
                </TouchableOpacity>
            </View>

            {/* Body */}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                <View style={{ padding: 16, gap: 12 }}>
                {/* Summary */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.rowBetween}>
                        <Text style={[styles.meta, { color: theme.muted }]}>Saved: ${goal.currentAmount.toFixed(0)}</Text>
                        <Text style={[styles.meta, { color: theme.muted }]}>Target: ${goal.targetAmount.toFixed(0)}</Text>
                    </View>
                    <View style={[styles.progressTrack, { backgroundColor: theme.muted || theme.border }]}>
                        <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: goal.color || theme.primary }]} />
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={[styles.meta, { color: theme.muted, marginTop: 8 }]}>
                            Completed: {Math.round(pct * 100)}% 
                        </Text>
                        <Text style={[styles.meta, { color: theme.muted, marginTop: 8 }]}>
                            Remaining: ${remaining.toFixed(0)}
                        </Text>
                    </View>
                </View>

                {/* Rename */}
                <View className="inline" style={styles.inline}>
                    <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Rename goal"
                    placeholderTextColor={"grey"}
                    style={[styles.input, { color: theme.foreground, borderColor: theme.border, backgroundColor: theme.input || theme.background }]}
                    />
                    <TouchableOpacity
                    onPress={async () => {
                        const trimmed = name.trim();
                        if (!trimmed) return;
                        await updateGoal(goal.id, { name: trimmed });
                    }}
                    style={[styles.btn, { backgroundColor: theme.primary }]}
                    >
                    <Text style={[styles.btnText, { color: theme.primaryForeground }]}>Save</Text>
                    </TouchableOpacity>
                </View>

                {/* Target */}
                <View style={styles.inline}>
                    <TextInput
                    value={targetStr}
                    onChangeText={setTargetStr}
                    keyboardType="numeric"
                    placeholder="Target $"
                    placeholderTextColor={"grey"}
                    style={[styles.input, { color: theme.foreground, borderColor: theme.border, backgroundColor: theme.input || theme.background }]}
                    />
                    <TouchableOpacity
                    onPress={async () => {
                        const t = Number(targetStr);
                        if (!Number.isFinite(t) || t <= 0) return Alert.alert("Enter a valid target.");
                        await updateGoal(goal.id, { targetAmount: Math.round(t) });
                    }}
                    style={[styles.btn, { backgroundColor: theme.primary }]}
                    >
                    <Text style={[styles.btnText, { color: theme.primaryForeground }]}>Update</Text>
                    </TouchableOpacity>
                </View>

                {/* Contribution */}
                <View style={styles.inline}>
                    <TextInput
                    value={contribStr}
                    onChangeText={setContribStr}
                    keyboardType="numeric"
                    placeholder="Add $"
                    placeholderTextColor={"grey"}
                    style={[styles.input, { color: theme.foreground, borderColor: theme.border, backgroundColor: theme.input || theme.background }]}
                    />
                    <TouchableOpacity
                    onPress={async () => {
                        const n = Number(contribStr);
                        if (!Number.isFinite(n) || n <= 0) return Alert.alert("Enter a positive amount.");
                        await addContribution(goal.id, Math.round(n));
                        setContribStr("");
                    }}
                    style={[styles.btn, { backgroundColor: "#22c55e" }]}
                    >
                    <Text style={[styles.btnText, { color: "#052e16" }]}>Add</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "800", flex: 1, textAlign: "center" },

  card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  meta: { fontSize: 13, fontWeight: "600" },

  inline: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  btn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  btnText: { fontWeight: "800", fontSize: 13 },

  progressTrack: { height: 10, borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
});
