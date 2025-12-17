import { getContributionWindow, getGoalScheduleInfo, Goal } from "@/data/goals";
import { THEME } from "@/lib/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleProp, StyleSheet, Text, TouchableOpacity, useColorScheme, View, ViewStyle } from "react-native";

type Props = {
  item: Goal;
  theme: any; // pass your theme object
  style?: StyleProp<ViewStyle>;
  onPress?: () => void; // optionally override navigation
  pressDisabled?: boolean;
};

type BannerStatusKey = "pending" | "fulfilled" | "completed" | "default";

const INTERVAL_STATUS_CONFIG: Record<
  BannerStatusKey,
  { label: string; color: string }
> = {
  pending:   { label: "pending contribution",   color: "#999999ff" },
  fulfilled: { label: "submitted contribution", color: "#1164fdff" },
  completed: { label: "completed!",         color: "#22c55eff" },
  default:   { label: "interval status",        color: "#d31717ff" },
};

export default function GoalCard({ item, style, onPress, pressDisabled }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  const isCompletedByAmount = item.currentAmount >= item.targetAmount;
  const isCompleted = item.goalStatus === "completed" || isCompletedByAmount;

  const [now, setNow] = useState(() => new Date());
  const { canContribute, nextDate, msUntilNext } = getContributionWindow(item, now);

  // Auto-refresh when the interval ends
  React.useEffect(() => {
    if (msUntilNext == null || msUntilNext <= 0) return;

    const timeout = setTimeout(() => {
      setNow(new Date());
    }, msUntilNext + 500); // small buffer so we're safely past the boundary

    return () => clearTimeout(timeout);
  }, [msUntilNext, item.id]);

  // Banner label text
  const nextContributionLabel = React.useMemo(() => {
    if (isCompleted) return "";
    if (canContribute) return "Available now";

    const formatted = nextDate.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    return `Next Contribution: ${formatted}`;
  }, [canContribute, nextDate]);

  // Effective status for the banner (flip back to pending when window is open)
  const effectiveStatusKey: BannerStatusKey = (() => {
    if (isCompleted) return "completed";
    if (canContribute) return "pending";

    return (item.intervalStatus as BannerStatusKey) ?? "default";
  })();

  const intervalStatusValue = INTERVAL_STATUS_CONFIG[effectiveStatusKey];


  const remaining = Math.max(0, item.targetAmount - item.currentAmount);
  const schedule = getGoalScheduleInfo(item);
  const unitLabel = item.interval === "daily" ? "day" : item.interval === "weekly" ? "week" : "month";

  const progress = Math.min( 100, Math.max(0, (item.currentAmount / Math.max(1, item.targetAmount)) * 100));
  const [barWidth, setBarWidth] = useState(0);

  // Saved ratio (left side)
  const savedRatio = Math.max( 0, Math.min(1, item.currentAmount / Math.max(1, item.targetAmount)));

  // Missing ratio (right side) – from missingAmount out of target
  const rawMissingRatio = Math.max( 0, Math.min(1, (item.missingAmount ?? 0) / Math.max(1, item.targetAmount)));

  // Don’t let missing overlap saved visually
  const missingRatio = Math.min(rawMissingRatio, 1 - savedRatio);

  // Widths in px
  const savedWidth = barWidth * savedRatio;
  const missingWidth = barWidth * missingRatio;

  return (
    <View style={style}>
      {/* INTERVAL STATUS SECTION ABOVE CARD */}
      <View style={styles.statusRow}>
        <View style={[ styles.statusBanner, { backgroundColor: intervalStatusValue.color }, ]} >
          <Text style={styles.statusText}>{intervalStatusValue.label}</Text>
        </View>

        <Text style={styles.nextContributionText} numberOfLines={1}>
          {nextContributionLabel}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={
          pressDisabled
            ? undefined
            : onPress ??
              (() =>
                router.push({
                  pathname: "/GoalsScreen/goal-options",
                  params: { id: item.id },
                }))
        }
        style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border, }, style, ]}>

        {/* HEADER */}
          {/* Goal Name & Target Amount */}
        <View style={[styles.columnContainer]}>
          <View style={[styles.rowContainer]}>
            <Text style={[styles.nameText, { color: theme.foreground }]} numberOfLines={1}>
              {item.name}
            </Text>

            <Text style={{ color: theme.foreground }}>
              ${item.targetAmount}
            </Text>
          </View>

            {/* Category & Max Contribution */}
          <View style={[styles.rowContainer, {marginBottom: 8}]}>
            <View style={[styles.categoryTag, (!item.category || item.category === "none") && { opacity: 0 }]}>
              {item.category && item.category !== "none" ? (
                <Text style={[styles.tagText, {color: "#336affff"}]} numberOfLines={1}>{item.category}</Text>
              ) : <Text style={[styles.tagText, {opacity: 0}]} numberOfLines={1}>placeholder</Text>}
            </View>

            <Text style={{ color: theme.foreground, fontSize: 12 }} numberOfLines={1}>${item.maxContribution} {item.interval}</Text>
          </View>

        </View>

        {/* PROGRESSION */}
        <View style={[styles.rowContainer, { marginTop: 12, alignItems: "center" }]}>
          {/* Percentage on the left */}
          <Text style={{ color: theme.foreground, width: 50 }}>
            {Math.round(progress)}%
          </Text>

          {/* Single bar with left/right fill + edge-anchored tags */}
          <View style={{ flex: 1, marginLeft: 8 }}>
            <View
              style={{ position: "relative" }}
              onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
            >
              {/* Saved tag (anchored left) */}
              {savedWidth > 0 && (
                <View style={[styles.tagContainer, {alignItems: "flex-start", left: 0, backgroundColor: "#01dd01ff"}]}>
                  <Text style={[styles.tagText]} numberOfLines={1} >
                    ${item.currentAmount}
                  </Text>
                </View>
              )} 

              {/* Missing tag (anchored right) */}
              {missingWidth > 0 && (
                <View style={[styles.tagContainer, {alignItems: "flex-end", right: 0, backgroundColor: "#ff5050ff"}]}>
                  <Text style={[styles.tagText]} numberOfLines={1} >
                    -${item.missingAmount ?? 0}
                  </Text>
                </View>
              )}

              {/* Base Progress track */}
              <View style={{ height: 10, width: "100%", backgroundColor: theme.muted, borderRadius: 10, overflow: "hidden", }} >
                {/* Left fill – saved */}
                <View style={[styles.barFiller, { left: 0,  width: savedWidth, backgroundColor: "#01dd01ff" }]} />

                {/* Right fill – missing */}
                <View style={[styles.barFiller, { right: 0,  width: missingWidth, backgroundColor: "#ff5050ff" }]} />
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={[styles.rowContainer, {marginTop: 8}]}>
          {schedule && (
            <Text style={{ color: theme.foreground }} numberOfLines={1}>
              {unitLabel.charAt(0).toUpperCase()+unitLabel.slice(1).toLowerCase()} {schedule.currentIndex}/{schedule.totalIntervals}
            </Text>
          )}
          
          <Text style={{ color: theme.foreground }}>${remaining} remaining</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    columnContainer: {
      flexDirection: "column", 
      justifyContent: "space-between",
      borderBottomWidth: 0, 
      borderBottomColor: "white"
    },
    rowContainer: {
      flexDirection: "row", 
      justifyContent: "space-between", 
    }, 
    card: {
      padding: 14, 
      borderTopLeftRadius: 0,
      borderTopRightRadius: 14,
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
      borderWidth: 1.5, 
      marginBottom: 20, 
      overflow: "hidden", 
    },
    nameText: {
      fontSize: 20,
      fontWeight: "600",
      textTransform: "none"
    },
    tagContainer: {
      position: "absolute",
      bottom: 12,
      paddingHorizontal: 4,
      paddingVertical: 3,
      borderRadius: 6,
    },
    barFiller: {
      position: "absolute",
      top: 0,
      bottom: 0,
    },
    categoryTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: '#d3defdff'
    },
    tagText: {
      color: "#ffffffff",
      fontSize: 11,
      fontWeight: "700",
      textTransform: "capitalize"
    },
    statusRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    statusBanner: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      alignSelf: "flex-start", // so it hugs the card width visually
      marginBottom: 0,
    },
    statusText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    nextContributionText: {
      fontSize: 12,
      fontWeight: "500",
      color: "#aaa", // or theme.foreground if you prefer
    },
});
