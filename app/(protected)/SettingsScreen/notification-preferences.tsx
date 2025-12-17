import React, { useEffect, useState } from "react";
import { View, Switch, Alert, Platform } from "react-native";
import { Stack } from "expo-router";

import { ScrollView } from "react-native";
import { useColorScheme } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Text } from "@/components/ui/text";
import SettingsCard from "@/components/settings/SettingsCard";
import SettingsItem from "@/components/settings/SettingsItem";
import { THEME } from "@/lib/theme";
import { Bell, BellRing } from "lucide-react-native";

const STORAGE_KEY = "notification_prefs_v1";

type NotificationPrefs = {
  enabled: boolean;
  marketing: boolean;
  reminders: boolean;
};

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: false,
  marketing: false,
  reminders: false,
};

export default function NotificationPreferencesScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? THEME.dark : THEME.light;

  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus | "unknown">("unknown");

  const loadPrefs = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      setPrefs(JSON.parse(raw));
    } catch {
      // ignore
    }
  };

  const savePrefs = async (next: NotificationPrefs) => {
    setPrefs(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const refreshPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
    return status;
  };

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    return status;
  };

  useEffect(() => {
    (async () => {
      await loadPrefs();
      await refreshPermission();
    })();
  }, []);

  const toggleEnabled = async (value: boolean) => {
    // Turning ON: request permission first
    if (value) {
      const current = await refreshPermission();
      const status = current === "granted" ? current : await requestPermission();

      if (status !== "granted") {
        Alert.alert(
          "Notifications are off",
          "You denied notification permission. You can enable it in your phone settings."
        );
        // Keep everything off
        await savePrefs({ ...prefs, enabled: false, marketing: false, reminders: false });
        return;
      }

      // If granted, enable master switch (keep other toggles as-is or default true if you prefer)
      await savePrefs({ ...prefs, enabled: true });
      return;
    }

    // Turning OFF: disable all preference toggles too
    await savePrefs({ ...prefs, enabled: false, marketing: false, reminders: false });
  };

  const toggleChild = async (key: "marketing" | "reminders", value: boolean) => {
    // If master is off, don’t allow child toggles
    if (!prefs.enabled) return;
    await savePrefs({ ...prefs, [key]: value });
  };

  const statusLabel =
    permissionStatus === "granted"
      ? "Granted"
      : permissionStatus === "denied"
      ? "Denied"
      : "Unknown";

  return (
      <>
       <Stack.Screen
              options={{ title: "Notification Preferences" }}
            />
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 py-6 gap-4 pb-24"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-1">
        <Text className="text-xl font-semibold">Notification Preferences</Text>
        <Text className="text-muted-foreground">
          {Platform.OS === "ios" ? "" : ""}
        </Text>
      </View>

      <SettingsCard className="overflow-hidden">
        <View className="px-4 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <BellRing size={18} color={colors.foreground} />
            <Text className="text-base">Enable Notifications</Text>
          </View>

          <Switch
            value={prefs.enabled}
            onValueChange={toggleEnabled}
          />
        </View>

        <View className="h-px bg-border/50 mx-4" />

        <View className="px-4 py-4 flex-row items-center justify-between opacity-100">
          <View className="flex-row items-center gap-3">
            <Bell size={18} color={colors.foreground} />
            <View>
              <Text className="text-base">Reminders</Text>
              <Text className="text-muted-foreground">
                Get reminders
              </Text>
            </View>
          </View>

          <Switch
            value={prefs.reminders}
            onValueChange={(v) => toggleChild("reminders", v)}
            disabled={!prefs.enabled}
          />
        </View>

        <View className="h-px bg-border/50 mx-4" />

        <View className="px-4 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Bell size={18} color={colors.foreground} />
            <View>
              <Text className="text-base">Marketing</Text>
              <Text className="text-muted-foreground">
                Product updates and tips
              </Text>
            </View>
          </View>

          <Switch
            value={prefs.marketing}
            onValueChange={(v) => toggleChild("marketing", v)}
            disabled={!prefs.enabled}
          />
        </View>
      </SettingsCard>
    </ScrollView>
    </>
  );
}
