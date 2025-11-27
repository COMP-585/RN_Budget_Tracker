import { Goal, GoalDoc } from "@/data/goals";
import { auth, db } from "@/FirebaseConfig";
import { THEME } from "@/lib/theme";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";


type Props = {
  goalId: string;
};

export default function GoalEditor({ goalId }: Props) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [target, setTarget] = useState<string>("");

  const uid = auth.currentUser?.uid;
  const [goal, setGoal] = useState<Goal | null>(null);
  

  useEffect(() => {
    if (!uid) return;
  
    // Goal
    const goalRef = doc(db, "users", uid, "goals", goalId);
    const unsubGoal = onSnapshot(goalRef, (snap) => {
      const data = snap.data() as GoalDoc | undefined; // no id here
      if (data) {
        const g: Goal = { id: snap.id, ...data };      // add id once
        setGoal(g);
        setName((prev) => (prev === "" ? g.name : prev));
        setTarget((prev) => (prev === "" ? String(g.targetAmount) : prev));
      }
      setLoading(false);
    });

    return () => {
      unsubGoal();
    };
  }, [uid, goalId]);

  const formattedCurrent = useMemo(() => {
    if (!goal) return "";
    const n = Number(goal.currentAmount || 0);
    return `$${n.toFixed(2)}`;
  }, [goal]);

  const handleSave = async () => {
    if (!uid) {
      Alert.alert("Not signed in", "Please sign in to update your goal.");
      return;
    }
    const trimmedName = name.trim();
    const targetNum = parseFloat(target);

    if (!trimmedName) {
      Alert.alert("Invalid name", "Please enter a goal name.");
      return;
    }
    if (isNaN(targetNum) || targetNum <= 0) {
      Alert.alert("Invalid target", "Please enter a valid target amount.");
      return;
    }

    try {
      setSaving(true);
      const goalRef = doc(db, "users", uid, "goals", goalId);
      await updateDoc(goalRef, {
        name: trimmedName,
        targetAmount: targetNum,
      } satisfies Partial<GoalDoc>);
      Alert.alert("Saved", "Your goal was updated.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to update goal.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !goal) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading goal…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingInline: 10,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {/* Header / Summary */}
      <View>
        <Text style={{ color: theme.foreground, fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
          Edit Goal
        </Text>

        {/* Name */}
        <Text style={{ color: theme.foreground, fontSize: 14, marginBottom: 6, }}>
          Goal Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Emergency Fund"
          style={{
            color: theme.foreground,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 10,
            fontSize: 16,
            marginBottom: 12,
          }}
          returnKeyType="done"
        />

        {/* Target */}
        <Text style={{ color: theme.foreground, fontSize: 14, marginBottom: 6, }}>
          Goal Target
        </Text>
        <TextInput
          value={target}
          onChangeText={setTarget}
          placeholder="e.g. 1000"
          keyboardType="numeric"
          style={{
            color: theme.foreground,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 10,
            fontSize: 16,
            marginBottom: 12,
          }}
          returnKeyType="done"
        />

        
        {/* Interval ======= TODO: ALLOW USER TO CHANGE INTERVAL BUT DISABLE EARNING COINS FROM GOAL*/}
        <Text style={{ color: theme.foreground, fontSize: 14, marginBottom: 6, }}>
          Goal Interval
        </Text>
        <TextInput
          value={target}
          onChangeText={setTarget}
          placeholder=""
          keyboardType="numeric"
          style={{
            color: theme.foreground,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 10,
            fontSize: 16,
            marginBottom: 12,
          }}
          returnKeyType="done"
        />

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: saving ? "#9ec7ff" : "#007AFF",
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <Text style={{ color: theme.foreground, fontSize: 16, fontWeight: "600" }}>
            {saving ? "Saving…" : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
