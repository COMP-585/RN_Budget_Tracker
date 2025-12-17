import { Image as ExpoImage } from "expo-image";
import { Link } from "expo-router";
import React, { useMemo } from "react";
import { Appearance, ScrollView, useColorScheme, View } from "react-native";

import SettingsCard from "@/components/settings/SettingsCard";
import SettingsItem from "@/components/settings/SettingsItem";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { auth } from "@/FirebaseConfig";
import useAuthStore from "@/lib/authStore";
import { deleteUser, signOut } from "firebase/auth";

import { THEME } from "@/lib/theme";
import {
  Bell,
  KeyRound,
  Link2,
  Palette,
  Scroll,
  Target,
  Trash2,
  UserRound,
} from "lucide-react-native";
import Header from "@/components/ui/header";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { user } = useAuthStore();

  // Fresh URI whenever photoURL changes (and bypass cache)
  const headerUri = useMemo(() => {
    const u = (user?.photoURL ?? "").trim();
    if (!u) return "";
    const sep = u.includes("?") ? "&" : "?";
    return `${u}${sep}cb=${Date.now()}`;
  }, [user?.photoURL]);

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 py-6 gap-6 pb-24"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Profile header */}
      <SafeAreaView className="items-center gap-4">
        <Header title="Account Settings"></Header>
        <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center overflow-hidden">
          {headerUri ? (
            <ExpoImage
              key={headerUri} // force remount on change
              source={{ uri: headerUri }}
              style={{
                width: 96,
                height: 96,
                borderRadius: 9999,
                backgroundColor: "#eee",
              }}
              contentFit="cover"
              cachePolicy="none"
            />
          ) : (
            <UserRound size={40} />
          )}
        </View>
        <View className="items-center">
          <Text className="text-xl font-semibold">
            {user?.displayName || "Your Name"}
          </Text>
          <Text className="text-muted-foreground">
            {user?.email || "email@example.com"}
          </Text>
        </View>
      </SafeAreaView>

      <View className="h-px bg-border/70" />

      <SettingsCard className="overflow-hidden">
        {/* Profile Information -> Edit Profile */}
        <Link href="/SettingsScreen/edit-profile" asChild>
          <SettingsItem
            label="Profile Information"
            leftIcon={<UserRound size={18} color={theme.foreground} />}
          />
        </Link>
        <View className="h-px bg-border/50 mx-4" />

        <SettingsItem
          label="Change Password"
          leftIcon={<KeyRound size={18} color={theme.foreground} />}
          onPress={() => {}}
        />
        <View className="h-px bg-border/50 mx-4" />

        <SettingsItem
          label="Linked Accounts"
          leftIcon={<Link2 size={18} color={theme.foreground} />}
          onPress={() => {}}
        />
        <View className="h-px bg-border/50 mx-4" />

        <SettingsItem
          label="Notification Preferences"
          leftIcon={<Bell size={18} color={theme.foreground} />}
          onPress={() => {}}
        />
        <View className="h-px bg-border/50 mx-4" />

        <SettingsItem
          label="Change Theme"
          leftIcon={<Palette size={18} color={theme.foreground} />}
          onPress={() => {
            Appearance.setColorScheme(
              colorScheme === "dark" ? "light" : "dark"
            );
          }}
        />
        <View className="h-px bg-border/50 mx-4" />

        <SettingsItem
          label="Update Goals"
          leftIcon={<Target size={18} color={theme.foreground} />}
          onPress={() => {}}
        />
        <View className="h-px bg-border/50 mx-4" />

        <SettingsItem
          label="Delete Profile"
          danger
          leftIcon={<Trash2 size={18} color={theme.foreground} />}
          onPress={async () => {
            if (auth.currentUser) {
              try {
                await deleteUser(auth.currentUser);
              } catch {
                // handle reauth required or ignore for now
              }
            }
          }}
        />
      </SettingsCard>

      <Button variant="secondary" onPress={() => signOut(auth)}>
        <Text>Sign Out</Text>
      </Button>
    </ScrollView>
  );
}
