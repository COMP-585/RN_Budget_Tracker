import CurrencyIcon from "@/assets/images/currency.png";
import Accordion from "@/components/ui/accordion";
import GoalCard from "@/components/ui/goalcard";
import GoalFormModal, { GoalFormValues } from "@/components/ui/goalformmodal";
import Header from "@/components/ui/header";
import Selector from "@/components/ui/selector";
import { createGoal, getContributionWindow, Goal, listenGoals } from "@/data/goals";
import { listenToUserProfile, UserProfile } from "@/data/users";
import { THEME } from "@/lib/theme";
import { Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function GoalsIndex() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "available"| "name" | "targetAmount" | "progress">("recent");



  const now = new Date();

  // 1) Start from all goals
  let visibleGoals = goals;

  // 2) Always hide paused/completed
  visibleGoals = visibleGoals.filter((g) => g.goalStatus === "active");

  // 3) Search filter
  visibleGoals = visibleGoals.filter((g) => {
    if (!search.trim()) return true;
    return g.name.toLowerCase().includes(search.toLowerCase());
  });

  // 4) Category filter
  visibleGoals = visibleGoals.filter((g) => {
    if (!category || category === "all") return true;

    if (category === "none") {
      return !g.category || g.category === "none";
    }

    return g.category === category;
  });

  // 5) Sorting
  const sortedGoals = [...visibleGoals].sort((a, b) => {
  const contribA = getContributionWindow(a, now).canContribute;
  const contribB = getContributionWindow(b, now).canContribute;

  // 1) Available-first mode
  if (sortBy === "available") {
    if (contribA && !contribB) return -1;
    if (contribB && !contribA) return 1;
    return a.name.localeCompare(b.name);
  }

  // 2) Recent mode (most recently touched first)
  if (sortBy === "recent") {
    const timeA =
      a.lastContributionAt?.toMillis?.() ??
      a.createdAt?.toMillis?.() ??
      0;
    const timeB =
      b.lastContributionAt?.toMillis?.() ??
      b.createdAt?.toMillis?.() ??
      0;

    // newer first
    return timeB - timeA;
  }

  // 3) Other modes
  if (sortBy === "name") {
    return a.name.localeCompare(b.name);
  }

  if (sortBy === "targetAmount") {
    return b.targetAmount - a.targetAmount;
  }

  if (sortBy === "progress") {
    const progressA = a.targetAmount ? a.currentAmount / a.targetAmount : 0;
    const progressB = b.targetAmount ? b.currentAmount / b.targetAmount : 0;
    return progressB - progressA; // high → low
  }

  return 0;
});





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

  
      <Accordion 
        title="Filter goals" 
        containerStyle={{backgroundColor: theme.background}}
        titleStyle={{color: theme.foreground}}
      >
        {/* Category filter */}
        <Selector
          size="sm"
          horizontal
          options={[
            { label: "All", value: "all" },
            { label: "None", value: "none" },
            { label: "Recreation", value: "recreation" },
            { label: "Dining", value: "dining" },
            { label: "Gift", value: "gift" },
            { label: "Travel", value: "travel" },
            { label: "Personal", value: "personal" },
            { label: "Educational", value: "educational" },
            { label: "Utility", value: "utility" },
            { label: "Important", value: "important" },
          ]}
          selectedValue={category ?? "all"}
          onChange={(val) => setCategory(val)}
          containerStyle={{ }}
        />
        
        {/* Sort-by selector */}
        <Selector
          size="sm"
          horizontal
          options={[
            { label: "Recent", value: "recent"},
            { label: "Available", value: "available"},
            { label: "Name", value: "name" },
            { label: "Target", value: "targetAmount" },
            { label: "Progress", value: "progress" },
          ]}
          selectedValue={sortBy}
          onChange={(val) => setSortBy(val as any)}
          containerStyle={{ }}
        />
      </Accordion>

      <TextInput
        placeholder="Search goals..."
        value={search}
        onChangeText={setSearch}
        style={{
          marginTop: 4,
          marginBottom: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.border,
          color: theme.foreground,
        }}
        placeholderTextColor="grey"
        returnKeyType="done"
      />

      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.primary }]}>
            You don't have any goals yet. Tap the + button to make one!
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedGoals}
          renderItem={renderGoal}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer]}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: "#1164fdff" }]}
        onPress={ () => setIsFormVisible(true)}
      >
        <Plus color={"white"} size={28} />
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
    paddingBottom: 20,
    marginTop: 10,
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
    borderRadius: 999 
  
  },
  cardFooter: { 
    marginTop: 10, 
    flexDirection: "row", 
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
