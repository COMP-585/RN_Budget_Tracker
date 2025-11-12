import React, { useMemo } from "react";
import { ScrollView, View, Alert, useColorScheme } from "react-native";
import { Link } from "expo-router";
import { Image as ExpoImage } from "expo-image";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import SettingsCard from "@/components/settings/SettingsCard";
import SettingsItem from "@/components/settings/SettingsItem";

import useAuthStore from "@/lib/authStore";
import { auth } from "@/FirebaseConfig";
import { signOut, deleteUser, sendPasswordResetEmail } from "firebase/auth";
import Toast from "react-native-toast-message";
import { THEME } from "@/lib/theme";

import {
  LogOut,
  UserRound,
  Bell,
  KeyRound,
  Palette,
  Target,
  Link2,
  Trash2,
} from "lucide-react-native";

export default function SettingsScreen() {
  const { user } = useAuthStore();
   const colorScheme = useColorScheme();
   const colors = colorScheme === "dark" ? THEME.dark : THEME.light;

  // Fresh URI whenever photoURL changes (and bypass cache)
  const headerUri = useMemo(() => {
    const u = (user?.photoURL ?? "").trim();
    if (!u) return "";
    const sep = u.includes("?") ? "&" : "?";
    return `${u}${sep}cb=${Date.now()}`;
  }, [user?.photoURL]);

   const handleChangePassword = async () => {
      if (!user?.email) {
        Toast.show({
                      type: "error",
                      text1: "No active user",
                      text2: "Please sign in and try again.",
                    });
        return;
      }
      try {
        await sendPasswordResetEmail(auth, user.email);
        Toast.show({
                      type: "success",
                      text1: "Email Sent",
                      text2: "Check your inbox for the password reset email",
                    });
      } catch (err: any) {
        Alert.alert("Error", err?.message ?? "Could not send password reset email.");
      }
    };

    const confirmAndDelete = () => {
        Alert.alert(
          "Delete profile?",
          "This will permanently delete your account. This cannot be undone.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: actuallyDeleteUser,
            },
          ]
        );
      };

      const actuallyDeleteUser = async () => {
        try {
          const cu = auth.currentUser;
          if (!cu) {
            Toast.show({
              type: "error",
              text1: "No active user",
              text2: "Please sign in and try again.",
            });
            return;
          }

          await deleteUser(cu);

          Toast.show({
            type: "success",
            text1: "Account deleted",
            text2: "Your profile has been removed.",
          });
        } catch (err: any) {
          const code = err?.code ?? "";
          const msg =
            code === "auth/requires-recent-login"
              ? "For security, please log out and log back in, then delete again."
              : err?.message ?? "Could not delete your account.";

          Toast.show({
            type: "error",
            text1: "Delete failed",
            text2: msg,
          });
        }
      };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 py-6 gap-6 pb-24"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Profile header */}
      <View className="items-center gap-4">
        <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center overflow-hidden">
          {headerUri ? (
            <ExpoImage
              key={headerUri} // force remount on change
              source={{ uri: headerUri }}
              style={{ width: 96, height: 96, borderRadius: 9999, backgroundColor: "#eee" }}
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
      </View>

      <View className="h-px bg-border/70" />

      <SettingsCard className="overflow-hidden">
        {/* Profile Information -> Edit Profile */}
        <Link href="/SettingsScreen/edit-profile" asChild>
          <SettingsItem label="Profile Information" leftIcon={<UserRound size={18} color={colors.foreground} />} />
        </Link>
        <View className="h-px bg-border/50 mx-4" />

        <SettingsItem
          label="Change Password"
          leftIcon={<KeyRound size={18} color={colors.foreground} />}
          onPress={handleChangePassword}
        />
        <View className="h-px bg-border/50 mx-4" />

        <SettingsItem
          label="Linked Accounts"
          leftIcon={<Link2 size={18} color={colors.foreground}/>}
          onPress={() => {}}
        />
        <View className="h-px bg-border/50 mx-4" />

        <SettingsItem
          label="Notification Preferences"
          leftIcon={<Bell size={18} color={colors.foreground} />}
          onPress={() => {}}
        />
        <View className="h-px bg-border/50 mx-4" />

        <SettingsItem
          label="Theme Settings"
          leftIcon={<Palette size={18} color={colors.foreground} />}
          onPress={() => {}}
        />
        <View className="h-px bg-border/50 mx-4" />

        <SettingsItem
          label="Delete Profile"
          danger
          leftIcon={<Trash2 size={18} color={colors.foreground} />}
          onPress={confirmAndDelete}

        />
      </SettingsCard>

      <Button variant="secondary" onPress={() => signOut(auth)}>
        <Text>Sign Out</Text>
      </Button>
    </ScrollView>
  );
}
