import CurrencyIcon from "@/assets/images/currency.png";
import GoalCard from "@/components/ui/goalcard";
import GoalFormModal, { GoalFormValues } from "@/components/ui/goalformmodal";
import Header from "@/components/ui/header";
import { createGoal, Goal, listenGoals } from "@/data/goals";
import { listenToUserProfile, UserProfile } from "@/data/users";
import { THEME } from "@/lib/theme";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";
import { FlatList, Image, StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function GoalsIndex() {
  const colorScheme = useColorScheme();
  const theme =  THEME.light;
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubProfile = listenToUserProfile(setProfile);
    const unsubGoals = listenGoals((rows: Goal[]) => setGoals(rows || []));
    return () =>  {
      unsubProfile?.();
      unsubGoals?.();
    };
  }, []);

  const handleAddGoal = async (values: GoalFormValues) => {
    await createGoal({
      name: values.name,
      targetAmount: values.targetAmount,
      currentAmount: 0,
      interval: values.interval,
      duration: values.duration,
      maxContribution: values.maxContribution,
      category: values.category
    });
  };

  const renderGoal = ({ item }: { item: Goal }) => (
    <GoalCard item={item} theme={theme} />
  );

  return (
    <SafeAreaView style={[styles.primaryContainer, { backgroundColor: theme.background }]}>
      <Header 
        title="Your Goals"
        rightComponent={
          <View style={[styles.coinsContainer]}>
            <Text style={[styles.meta, { color: theme.foreground, padding: 6}]}>{profile?.coins?? 0}</Text>
            <Image
              source={CurrencyIcon}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          </View>
        }
      />

      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: "grey" }]}>
            You don&apos;t have any goals yet. Tap the + button to make one!
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
        style={[styles.floatingButton, { backgroundColor: "#1164fdff" }]}
        onPress={ () => setIsFormVisible(true)}
      >
        <Plus color={theme.primaryForeground} size={28} />
      </TouchableOpacity>
      <GoalFormModal
        visible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSubmit={handleAddGoal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  primaryContainer: { 
    flex: 1, 
    padding: 20 

  },
  listContainer: { 
    paddingBottom: 120, 
    shadowOpacity: 0.1,
    shadowOffset: {width: 0.2, height: 2}

  },
  coinsContainer: {
    flex: 1,
    flexDirection: 'row',

  },
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
  cardHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 10 

  },
  goalText: { 
    fontSize: 16, 
    fontWeight: "700", 
    flex: 1, 
    marginRight: 8 

  },
  meta: { 
    fontSize: 13, 
    fontWeight: "500" 

  },
  progressTrack: { height: 10, 
    borderRadius: 999, 
    overflow: "hidden" 

  },
  progressFill: { 
    height: "100%", 
    borderRadius: 999 },
  cardFooter: { 
    marginTop: 10, flexDirection: "row", 
    justifyContent: "space-between" 

  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 

  },
  emptyText: { 
    fontSize: 16, 
    textAlign: "center" 

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
});
