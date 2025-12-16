import { THEME } from "@/lib/theme";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, KeyboardAvoidingView, Modal, PanResponder, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import Selector from "./selector";

export type GoalFormValues = {
  name: string;             // name of goal
  targetAmount: number;     // total goal amount
  interval: string;         // is either daily, weekly, or monthly
  duration: number;         // number of intervals
  maxContribution: number;  // maximum contribution per interval
  category: string;         // chosen category of goal 
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: GoalFormValues) => void;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function GoalFormModal({ visible, onClose, onSubmit }: Props) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [interval, setInterval] = useState("");
  const ALTDISPLAY_INTERVAL: Record<string, string> = {
    daily: "day",
    weekly: "week",
    monthly: "month",
  };

  const [duration, setDuration] = useState("");
  const [method, setMethod] = useState("time");
  const [maxContribution, setMaxContribution] = useState("");
  const [category, setCategory] = useState("none");
  
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  // animated value to slide sheet up/down
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // slide in when visible becomes true
  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      // reset position when not visible so it's ready next time
      translateY.setValue(SCREEN_HEIGHT);
    }
  }, [visible, translateY]);

  const closeWithAnimation = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  // Clear form when modal is closed
  useEffect(() => {
    if (!visible) {
      setName("");
      setTarget("");
      setInterval("");
      setDuration("");
      setMethod("time");
      setMaxContribution("");
      setCategory("none");
    }
  }, [visible]);

  useEffect(() => {
    const targetNum = Number(target);
    let durationNum = Number(duration);
    let maxContributionNum = Number(maxContribution);

    if (!targetNum || targetNum <= 0 || !interval || !name ) {
      setIsPreviewReady(false);
      return;
    }

    if (method === "time") {
      if (!durationNum || durationNum <= 0) {
        setIsPreviewReady(false);
        return;
      }
      maxContributionNum = Math.ceil(targetNum/durationNum);
      setMaxContribution(String(maxContributionNum));
      setIsPreviewReady(true);
    } else if (method === "amount") {
      if (!maxContribution || maxContributionNum <= 0) {
        setIsPreviewReady(false);
        return;
      }
      durationNum = Math.ceil(targetNum/maxContributionNum);
      setDuration(String(durationNum));
      setIsPreviewReady(true);
    } else {
      setIsPreviewReady(false);
    }
  }, [name, target, interval, duration, method, maxContribution]);

  const handleSubmit = () => {
    if (!isPreviewReady) return;

    onSubmit({
      name: name.trim(),
      targetAmount: Number(target.trim()),
      interval: interval.trim(),
      duration: Number(duration.trim()),
      maxContribution: Number(maxContribution.trim()),
      category: category
    });

    closeWithAnimation();
  };

  const PULL_ZONE_HEIGHT = 60; // changes the pull zone
  const dragStartY = useRef(0);

  // Swipe down to close using PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, _gestureState) => {
        // Only start pan if touch begins near the top of the sheet (header area)
        const y = evt.nativeEvent.locationY; // relative to sheet container
        dragStartY.current = y;
        return y < PULL_ZONE_HEIGHT; // this number = pull zone height
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only ever become a pan responder if the touch started in the pull zone
        if (dragStartY.current >= PULL_ZONE_HEIGHT) return false;
        return Math.abs(gestureState.dy) > 6; // small threshold to avoid jitters
      },
      onPanResponderMove: (_evt, gestureState) => {
        // Extra safety: if somehow this got set outside the pull zone, ignore
        if (dragStartY.current >= PULL_ZONE_HEIGHT) return;

        const dragY = Math.max(0, gestureState.dy);
        const damped = dragY * 0.5; // soften the motion
        translateY.setValue(damped);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (dragStartY.current >= PULL_ZONE_HEIGHT) {
          // shouldn't happen, but just in case
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          return;
        }

        const dragDistance = gestureState.dy;
        const dragSpeed = gestureState.vy;

        const shouldClose =
          dragDistance > SCREEN_HEIGHT * 0.35 || // higher = longer drag required
          dragSpeed > 1.5;                       // higher = faster fling required

        if (shouldClose) {
          closeWithAnimation();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 7,    // heavy snap-back
            tension: 60,
          }).start();
        }

        // reset for next gesture
        dragStartY.current = 0;
      },
    })
  ).current;


  return (
    <Modal
      visible={visible}
      transparent
      animationType="none" // we handle animation with Animated + translateY
      onRequestClose={closeWithAnimation}
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={-200}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <Animated.View
            style={[styles.sheetContainer, {backgroundColor: theme.muted, transform: [{ translateY }] }]}
            {...panResponder.panHandlers}
          >
            {/* Header with drag indicator + X */}
            <View style={styles.header}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.dragRegion}
              >
                <View style={styles.dragHandle} />
              </TouchableOpacity>
              <Text style={[styles.title, {color: theme.foreground}]}>Create Goal</Text>
              <TouchableOpacity onPress={closeWithAnimation} style={styles.closeButton}>
                <Text style={[styles.closeText, {color: theme.foreground}]}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              
              <Text style={[styles.heading, {color: theme.foreground}]}>What are you saving up for?</Text>

              <View style={styles.field}>
                <View style={styles.rowContainer}>
                  <Text style={[styles.body, {color: theme.foreground}]}>I'm saving for...</Text>
                </View>
                <TextInput
                  value={name}
                  onChangeText={(text) => setName(text)}
                  placeholder="Ex: New Laptop"
                  placeholderTextColor="#999"
                  returnKeyType="done"
                  maxLength={25}
                  style={[styles.inputText, {color: theme.foreground}]}
                  
                />
              </View>

              <View style={styles.field}>
                <View style={styles.rowContainer}>
                  <Text style={[styles.body, {color: theme.foreground}]}>and it costs...</Text>
                </View>
                <View style={[{flex: 1, flexDirection: "row", }]}>
                  <Text style={[styles.body, {fontSize: 20, color: theme.foreground}]}>$</Text>
                  <TextInput
                    value={target}
                    onChangeText={(text) => {
                      let cleaned = text;
                      cleaned = cleaned.replace(/[^0-9]/g, "");
                      const numeric = parseFloat(cleaned);
                      if (!isNaN(numeric) && numeric > 100000) {
                        cleaned = "100000";
                      }

                      // Prevent leading zeros like "00012" → "12"
                      if (cleaned !== "" && cleaned[0] === "0") {
                        cleaned = String(parseFloat(cleaned));
                      }

                      setTarget(cleaned);
                    }}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    placeholder="0"
                    placeholderTextColor="#999"
                    maxLength={5}
                    style={[styles.inputNumber, {color: theme.foreground}]}
                  />
                </View>
              </View>

              <Text style={[styles.heading, {color: theme.foreground}]}>How would you like to save up?</Text>

              <View style={styles.field}>
                <View style={[styles.rowContainer, { justifyContent: "space-evenly" } ]}>
                  {["time", "amount"].map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setMethod(option); 
                        setDuration("");
                        setMaxContribution("");
                      }}
                      style={[ styles.buttonOption, method === option && styles.buttonOptionSelected ]}
                    >
                      <Text style={[ styles.buttonOptionText, method === option && styles.buttonOptionTextSelected, ]}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>

                    </TouchableOpacity>
                  ))}
                </View>

                <View style={[styles.field, {flexDirection: "column", alignContent: "space-between", justifyContent: "space-evenly", marginTop: 10}]}>
                  { method === "time" ? (
                    <>
                      <Text style={[styles.body, {color: theme.foreground}]}>I want to reach my goal in...</Text>

                      <View style={[{flexDirection: "row", }]}>
                        <TextInput
                          value={duration}
                          onChangeText={(text) => {
                            let cleaned = text.replace(/[^0-9]/g, "");
                            if (cleaned.length > 3) {
                              cleaned = cleaned.slice(0,3);
                            }
                            setDuration(cleaned);
                          }}
                          keyboardType="number-pad"
                          placeholder="# of"
                          placeholderTextColor="#999"
                          returnKeyType="done"
                          textAlign="center"
                          maxLength={3}
                          style={[styles.inputNumber, {flex:.9, marginBottom: 14, color: theme.primary }]}
                        />
                        <Selector 
                          options={[
                            {label: "Days", value: "daily"},
                            {label: "Weeks", value: "weekly"},
                            {label: "Months", value: "monthly"}
                          ]}
                          selectedValue={interval}
                          onChange={(value) => setInterval(value)}
                          horizontal={true}
                        />
                      </View>
                    </>
                  ) : method === "amount" ? (
                    <>
                      <Text style={[styles.body, {color: theme.foreground}]}>I want to reach my goal by saving...</Text>

                      <View style={[{flex:1, flexDirection: "row", }]}>
                        <Text style={[styles.body, {fontSize: 20, marginTop: 9, color: theme.foreground}]}>$</Text>
                        <TextInput
                          value={maxContribution}
                          onChangeText={(text) => {
                            let cleaned = text.replace(/[^0-9]/g, "");
                            if (cleaned.length > 4) {
                              cleaned = cleaned.slice(0,4);
                            }
                            setMaxContribution(cleaned);
                          }}
                          keyboardType="number-pad"
                          placeholder="0"
                          returnKeyType="done"
                          textAlign="center"
                          maxLength={4}
                          style={[styles.inputNumber, {flex:.9, marginBottom: 14, color: theme.foreground }]}
                        />
                        <Selector 
                          options={[
                            {label: "Daily", value: "daily"},
                            {label: "Weekly", value: "weekly"},
                            {label: "Monthly", value: "monthly"}
                          ]}
                          selectedValue={interval}
                          onChange={(value) => setInterval(value)}
                          horizontal={true}
                        />
                      </View>
                    </>
                  ) : null}
                </View>

              </View>

              <Text style={[styles.heading, {color: theme.foreground}]}>Select a category for this goal?</Text>

              <View style={[styles.field]}>
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
              </View>
              
              { isPreviewReady ? (
                <Text style={[styles.body, {color: theme.foreground}]}>
                  By saving ${maxContribution} {interval}, you will reach ${target} in {duration} {ALTDISPLAY_INTERVAL[interval]}{Number(duration) !== 1 ? "s" : ""}.
                </Text>
              ) : null}


              {/* Primary button */}
              <TouchableOpacity 
                style={isPreviewReady ? styles.primaryButton : styles.primaryButtonDisabled} 
                onPress={handleSubmit} 
                disabled={!isPreviewReady}>
                <Text style={styles.primaryButtonText}>Create</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 16,
    height: SCREEN_HEIGHT * 0.8,
  },
  header: {
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  dragRegion: {
    flex: 1,                // takes up left part of header
    alignItems: "center",
    paddingVertical: 8,     // makes it easier to grab
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    marginBottom: 8,
  },
  closeButton: {
    position: "absolute",
    right: 8,
    top: 0,
    padding: 8,
  },
  closeText: {
    fontSize: 30,
    lineHeight: 26,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 4,
  },
  field: {
    marginBottom: 12,
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
    borderBottomWidth: 1.5,
    borderBottomColor: "#ccc",
  },
  intervalScroll: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 4,
  },
  buttonOption: {
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 4,
  },
  buttonOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  buttonOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  buttonOptionTextSelected: {
    color: "#fff",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
    primaryButtonDisabled: {
    marginTop: 12,
    backgroundColor: "#a0a0a0ff",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
});
