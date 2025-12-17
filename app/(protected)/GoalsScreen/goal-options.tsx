import Accordion from "@/components/ui/accordion";
import GoalCard from "@/components/ui/goalcard";
import Selector from "@/components/ui/selector";
import { addContribution, Contribution, ContributionDoc, ContributionType, deleteGoal, getContributionWindow, getFullIntervalsBetween, Goal, GoalDoc } from "@/data/goals";
import { auth, db } from "@/FirebaseConfig";
import { THEME } from "@/lib/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, increment, onSnapshot, orderBy, query, Timestamp, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const uid = auth.currentUser?.uid;
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loadingGoal, setLoadingGoal] = useState(true);

  // Edit section state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);

  // Contribute / history state
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);

  const [amendAmount, setAmendAmount] = useState("");
  const [amendSubmitting, setAmendSubmitting] = useState(false);

  const { canContribute, nextDate } = goal
    ? getContributionWindow(goal)
    : { canContribute: false, nextDate: new Date() };



  // Guard against missing id
  useEffect(() => {
    if (!id) router.back();
  }, [id]);

  // Live subscribe to goal
  useEffect(() => {
    if (!id || !uid) return;

    const ref = doc(db, "users", uid, "goals", String(id));
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() as GoalDoc | undefined;
      if (data) {
        const g: Goal = { id: snap.id, ...data };
        setGoal(g);

        // Initialize edit fields once
        setName((prev) => (prev === "" ? g.name : prev));
        setCategory((prev) => (prev === "" ? g.category : prev));
      } else {
        setGoal(null);
      }
      setLoadingGoal(false);
    });

    return () => unsub();
  }, [id, uid]);

  // Live subscribe to contributions
  useEffect(() => {
    if (!id || !uid) return;

    const contribQ = query(
      collection(db, "users", uid, "goals", String(id), "contributions"),
      orderBy("createdAt", "desc")
    );
    const unsubContribs = onSnapshot(contribQ, (snap) => {
      const rows: Contribution[] = snap.docs.map((d) => {
        const c = d.data() as ContributionDoc;
        return { id: d.id, ...c };
      });
      setContributions(rows);
    });

    return () => {
      unsubContribs();
    };
  }, [id, uid]);

  const handleDelete = () => {
    if (!goal) return;
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
  };

  const handleSave = async () => {
    if (!uid || !id) {
      Alert.alert("Not signed in", "Please sign in to update your goal.");
      return;
    }

    const trimmedName = name.trim();
    const trimmedCategory = category.trim();

    if (!trimmedName) {
      Alert.alert("Invalid name", "Please enter a goal name.");
      return;
    }


    try {
      setSaving(true);
      const goalRef = doc(db, "users", uid, "goals", String(id));
      await updateDoc(goalRef, {
        name: trimmedName,
        category: trimmedCategory,
      } as Partial<GoalDoc>);
      Alert.alert("Saved", "Your goal was updated.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to update goal.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitContribution = async () => {
    if (!id || !goal) return;

    const n = parseFloat(amount);
    if (!n || n <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!canContribute) {
      const formatted = nextDate.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
      Alert.alert(
        "Too early",
        `You can contribute again on ${formatted}.`
      );
      return;
    }

    try {
      setSubmitting(true);
      await addContribution(String(id), Number(n.toFixed(2)), "contribution");

      const anchorDate =
        goal.lastContributionAt?.toDate() ??
        goal.createdAt?.toDate() ??
        new Date();

      const now = new Date();

      // how many full intervals have passed since anchorDate
      const intervalsPassed = getFullIntervalsBetween( anchorDate, now, goal.interval );

      // we treat this current contribution as fulfilling the *current* interval,
      // so only previous ones are "missed"
      const missedIntervals = Math.max(0, intervalsPassed - 1);

      const timeMissedAmount = missedIntervals * goal.maxContribution;

      // 3) Partial under-contribution diff for *this* interval
      const partialDiff = Math.max(0, goal.maxContribution - n);

      const totalMissingDelta = timeMissedAmount + partialDiff;
      if (totalMissingDelta > 0) {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("Not signed in");

        const goalRef = doc(db, "users", uid, "goals", String(id));

        await updateDoc(goalRef, {
          // add time-based missed amount + under-contribution diff
          missingAmount: increment(totalMissingDelta),
        });
      }

      setAmount("");
      Keyboard.dismiss();
    } catch (e: any) {
      alert(e?.message ?? "Failed to add contribution.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAmend = async () => {
    if (!id || !goal) return;

    const n = parseFloat(amendAmount);
    if (!n || n <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    // optional: enforce not going over missingAmount
    if (goal && n > (goal.missingAmount ?? 0)) {
      alert("You can't amend more than the missing amount.");
      return;
    }

    try {
      setAmendSubmitting(true);
      await addContribution( String(id), Number(n.toFixed(2)), "amendment" );

      await updateDoc(doc(db, "users", uid!, "goals", String(id)), {
        missingAmount: increment(-n),
      });

      setAmendAmount("");
      Keyboard.dismiss();
    } catch (e: any) {
      alert(e?.message ?? "Failed to add amendment.");
    } finally {
      setAmendSubmitting(false);
    }
  };

  if (loadingGoal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ color: theme.muted, marginTop: 8 }}>Loading goal…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: theme.muted }}>Goal not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCompletedByAmount = goal.currentAmount >= goal.targetAmount;
  const isCompleted = goal.goalStatus === "completed" || isCompletedByAmount;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={{ color: theme.foreground, fontWeight: "700" }}>Back</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.foreground }]} numberOfLines={1}>{goal.name}</Text>

        <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
          <Text style={{ color: theme.destructive || "#ef4444", fontWeight: "700" }}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Summary card – reuse GoalCard */}
      <GoalCard
        item={goal}
        theme={theme}
        style={{ marginInline: 10 }}
        pressDisabled
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Accordions */}
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Contribute accordion */}
          <Accordion 
            title="Contribute" initiallyOpen
            containerStyle={{backgroundColor: theme.background}}
            titleStyle={{color: theme.foreground}}
          >
            <Text style={{ color: theme.foreground, fontSize: 16, fontWeight: "600", marginBottom: 8, }} >Feed goal</Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1.5,
                borderBottomColor: "#ccc",
                paddingVertical: 4,
                marginBottom: 20
              }}
            >
              <Text style={{ fontSize: 20, color: theme.foreground, marginRight: 4 }}>$</Text>

              {/* Contribution Input */}
              <TextInput
                value={amount}
                onChangeText={(text) => {
                  let cleaned = text.replace(/[^0-9]/g, "");
                  if (cleaned === "") {
                    setAmount("");
                    return;
                  }
                  let num = Number(cleaned);
                  if (num > goal.maxContribution) {
                    num = goal.maxContribution;
                  }
                  setAmount(String(num));
                }}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder="0"
                placeholderTextColor="#999"
                style={{
                  flex: 1,
                  fontSize: 20,
                  color: theme.foreground,
                  paddingVertical: 0,
                }}
              />

              {/* Max Button */}
              <TouchableOpacity
                onPress={() => setAmount(String(goal.maxContribution))}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: "#1164fd",
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Max</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitContribution}
              disabled={submitting || !canContribute}
              style={{
                backgroundColor:
                  !canContribute
                    ? "#9aa39a"      // disabled gray
                    : submitting
                    ? "#7ee9a0"
                    : "#03ce40ff",
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center",
                opacity: !canContribute ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                { isCompleted
                  ? "Completed"
                  : !canContribute
                  ? "Already Contributed"
                  : submitting
                  ? "Contributing..."
                  : "Contribute"}
              </Text>
            </TouchableOpacity>


            {goal.missingAmount > 0 && (
              <View style={{marginTop: 40}}>
                <Text style={{ color: theme.foreground, fontSize: 16, fontWeight: "600", marginBottom: 8, }} >Amend goal</Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderBottomWidth: 1.5,
                    borderBottomColor: "#ccc",
                    paddingVertical: 4,
                    marginBottom: 20,
                  }}
                >
                  <Text style={{ fontSize: 20, color: theme.foreground, marginRight: 4 }}>$</Text>

                  <TextInput
                    value={amendAmount}
                    onChangeText={(text) => {
                      let cleaned = text.replace(/[^0-9]/g, "");
                      if (cleaned === "") {
                        setAmendAmount("");
                        return;
                      }
                      let num = Number(cleaned);
                      if (num > goal.missingAmount) {
                        num = goal.missingAmount;
                      }
                      setAmendAmount(String(num));
                    }}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="#999"
                    style={{
                      flex: 1,
                      fontSize: 20,
                      color: theme.foreground,
                      paddingVertical: 0,
                    }}
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setAmendAmount(String(goal.missingAmount ?? 0))
                    }
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: "#1164fd",
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "600" }}>Max</Text>
                  </TouchableOpacity>
                </View>

                {/* Amend submit button */}
                <TouchableOpacity
                  onPress={handleSubmitAmend}
                  disabled={amendSubmitting}
                  style={{
                    backgroundColor: amendSubmitting ? "#fbbf94" : "#f97316",
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }} >
                    {amendSubmitting ? "Amending..." : "Amend"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Accordion>

          {/* History accordion */}
          <Accordion 
            title="History"
            containerStyle={{backgroundColor: theme.background}}
            titleStyle={{color: theme.foreground}}
          >
            <View style={{ backgroundColor: theme.background, padding: 12, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 3, elevation: 1, }}>
              <Text style={{ color: theme.foreground, fontSize: 18, fontWeight: "700", marginBottom: 8, }} >Past Contributions</Text>

              {contributions.length === 0 ? (
                <Text style={{ color: "grey" }}>No contributions yet.</Text>
              ) : (
                <FlatList
                  data={contributions}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => (
                    <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 8, }} />
                  )}
                  renderItem={({ item }) => {
                    const ts = item.createdAt as Timestamp | undefined;
                    const dateObj = ts?.toDate?.();
                    const dateStr =
                      dateObj instanceof Date ? dateObj.toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      }) : "—";
                    const amt = typeof item.amount === "number" ? item.amount : 0;

                    const type = (item as any).type as ContributionType | undefined;
                    const label =
                      type === "amendment" ? "Amendment" : "Contribution";
                    return (
                      <View style={{ paddingVertical: 6 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", }} >
                          <Text style={{ color: theme.foreground, fontWeight: "600" }}>${amt}</Text>
                          
                          <Text style={{ color: "grey", fontSize: 12 }}>{dateStr}</Text>
                        </View>
                        <Text style={{ color: theme.foreground, fontWeight: "500" }}>{label}</Text>
                      </View>
                    );
                  }}
                  contentContainerStyle={{ paddingBottom: 12 }}
                />
              )}
            </View>
          </Accordion>

          {/* Edit accordion */}
          <Accordion 
            title="Edit"
            containerStyle={{backgroundColor: theme.background}}
            titleStyle={{color: theme.foreground}}
          >
            <View>
              {/* Name */}
              <Text style={{ color: theme.foreground, fontSize: 14, marginBottom: 6, }} >
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
              <Text style={{ color: theme.foreground, fontSize: 14, marginBottom: 6, }} >
                Goal Category
              </Text>
              <Selector
                options={[
                  {label: "None", value: "none"},
                  {label: "Recreation", value: "recreation"},
                  {label: "Dining", value: "dining"},
                  {label: "Gift", value: "gift"},
                  {label: "Travel", value: "travel"},
                  {label: "Personal", value: "personal"},
                  {label: "Educational", value: "educational"},
                  {label: "Utility", value: "utility"},
                  {label: "Important", value: "important"},
                ]}
                selectedValue={category}
                onChange={(value) => setCategory(value)}
                horizontal={true}
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
                <Text style={{ color: "white", fontSize: 16, fontWeight: "600", }} >
                  {saving ? "Saving…" : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </Accordion>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  inputText: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 20,
  },
  inputNumber: {
    flex: 1,
    fontSize: 20,
    color: "#000",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000000ff",
    padding: 20
  },
});