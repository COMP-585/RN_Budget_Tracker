import GoalEditor from "@/components/ui/goaldetailer";
import GoalFeeder from "@/components/ui/goalfeeder";
import { deleteGoal } from "@/data/goals";
import { auth, db } from "@/FirebaseConfig";
import { THEME } from "@/lib/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
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

  const [activeTab, setActiveTab] = useState("Feed");
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={{ color: "white", fontWeight: "700" }}>Back</Text>
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

      {/* Summary */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.rowBetween}>
              <Text style={[styles.meta, { color: "white" }]}>Saved: ${goal.currentAmount.toFixed(0)}</Text>
              <Text style={[styles.meta, { color: "white" }]}>Target: ${goal.targetAmount.toFixed(0)}</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.muted || theme.border }]}>
              <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: goal.color || theme.primary }]} />
          </View>
          <View style={styles.rowBetween}>
              <Text style={[styles.meta, { color: "white", marginTop: 8 }]}>
                  Completed: {Math.round(pct * 100)}% 
              </Text>
              <Text style={[styles.meta, { color: "white", marginTop: 8 }]}>
                  Remaining: ${remaining.toFixed(0)}
              </Text>
          </View>
      </View>

      {/* Top Tabs */}
      <View style={{ flex: 1, paddingTop: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-around", borderBottomWidth: 1, borderBottomColor: "#ccc", }} >
          <TouchableOpacity
            onPress={() => setActiveTab("Feed")}
            style={{ flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: activeTab === "Feed" ? 3 : 0, borderBottomColor: activeTab === "Feed" ? "#007AFF" : "transparent",}}>
            <Text style={{ color: activeTab === "Feed" ? "#007AFF" : "#888", fontWeight: "bold", }} >
              Feed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("Details")}
            style={{ flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: activeTab === "Details" ? 3 : 0, borderBottomColor: activeTab === "Details" ? "#007AFF" : "transparent", }}>
            <Text style={{ color: activeTab === "Details" ? "#007AFF" : "#888", fontWeight: "bold", }} >
              Details
            </Text>
          </TouchableOpacity>
        </View>
        {/* Tab Content */}
        <View style={{ flex: 1, padding: 20 }}>
          {activeTab === "Feed" ? (
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
              <GoalFeeder goalId={goal.id} />
            </KeyboardAvoidingView>
          ) : (
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                  <GoalEditor goalId={goal.id} />
              </KeyboardAvoidingView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  
  },
  header: {
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

  },
  headerBtn: { 
    padding: 8 

  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "800", 
    flex: 1, 
    textAlign: "center" 

  },
  card: { 
    borderRadius: 12, 
    borderWidth: 1, 
    padding: 16, 
    gap: 8 

  },
  rowBetween: { 
    flexDirection: "row", 
    justifyContent: "space-between" 

  },
  meta: { 
    fontSize: 13, 
    fontWeight: "600"

  },

  inline: { 
    flexDirection: "row", 
    gap: 8, 
    alignItems: "center" 

  },
  input: { flex: 1, 
    borderWidth: 1, 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    fontSize: 15 

  },
  btn: { 
    borderRadius: 10, 
    paddingHorizontal: 14, 
    paddingVertical: 10 

  },
  btnText: { 
    fontWeight: "800", 
    fontSize: 13 

  },

  progressTrack: { 
    height: 10, 
    borderRadius: 999, 
    overflow: "hidden" 

  },
  progressFill: { 
    height: "100%", 
    borderRadius: 999 

  },
});
