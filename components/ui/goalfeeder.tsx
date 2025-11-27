import { addContribution, Contribution, ContributionDoc } from "@/data/goals";
import { auth, db } from "@/FirebaseConfig";
import { THEME } from "@/lib/theme";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";


type Props = {
  goalId: string;
};

export default function GoalFeeder({ goalId }: Props) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const uid = auth.currentUser?.uid;
  const [contributions, setContributions] = useState<Contribution[]>([]);

  const handleSubmit = async () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setSubmitting(true);
      // trims message; data layer also handles serverTimestamp + goal counters
      await addContribution(goalId, Number(n.toFixed(2)), message.trim() || undefined);
      setAmount("");
      setMessage("");
      Keyboard.dismiss();
    } catch (e: any) {
      alert(e?.message ?? "Failed to add contribution.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
      if (!uid) return;
  
      // Contributions
      const contribQ = query(
        collection(db, "users", uid, "goals", goalId, "contributions"),
        orderBy("createdAt", "desc")
      );
      const unsubContribs = onSnapshot(contribQ, (snap) => {
        const rows: Contribution[] = snap.docs.map((d) => {
          const c = d.data() as ContributionDoc;        // no id here
          return { id: d.id, ...c };                    // add id once
        });
        setContributions(rows);
      });
  
      return () => {
        unsubContribs();
      };
    }, [uid, goalId]);

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
      <Text style={{ color: theme.foreground, fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
        Feed goal
      </Text>
      {/* Amount Input */}
      <TextInput
        returnKeyType="done"
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={{
          color: theme.foreground,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
          fontSize: 16,
        }}
      />

      <Text style={{ color: theme.foreground, fontSize: 18, fontWeight: "600", marginBottom: 8, }}>
        Optional note
      </Text>
      {/* Optional Message */}
      <TextInput
        returnKeyType="done"
        placeholder="Note (e.g. '10% of paycheck')"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
        style={{
          color: theme.foreground,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          fontSize: 16,
          marginBottom: 16,
          textAlignVertical: "top",
        }}
      />

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: "#03ce40ff",
          borderRadius: 8,
          paddingVertical: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.foreground, fontSize: 16, fontWeight: "600" }}>
          Submit
        </Text>
      </TouchableOpacity>

            {/* Contributions List */}
      <View
        style={{
          backgroundColor: theme.background,
          padding: 12,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 3,
          elevation: 1,
        }}
      >
        <Text style={{ color: theme.foreground, fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
          Contributions
        </Text>

        {contributions.length === 0 ? (
          <Text style={{ color: "grey" }}>No contributions yet.</Text>
        ) : (
          <FlatList
            data={contributions}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height: 1,
                  backgroundColor: "#eee",
                  marginVertical: 8,
                }}
              />
            )}
            renderItem={({ item }) => {
              const dateStr =
                item.createdAt?.toDate?.() instanceof Date
                  ? item.createdAt.toDate().toLocaleString()
                  : "—";
              const amt = typeof item.amount === "number" ? item.amount : 0;
              return (
                <View style={{ paddingVertical: 6 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: theme.foreground, fontWeight: "600" }}>
                      ${amt.toFixed(2)}
                    </Text>
                    <Text style={{ color: "grey", fontSize: 12 }}>{dateStr}</Text>
                  </View>
                  {item.message ? (
                    <Text style={{ color: theme.foreground, marginTop: 4, }}>
                      {item.message}
                    </Text>
                  ) : null}
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 12 }}
          />
        )}
      </View>

    </ScrollView>
  );
}
