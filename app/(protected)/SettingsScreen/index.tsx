import { Image as ExpoImage } from "expo-image";
import { Link } from "expo-router";
import React, { useMemo } from "react";
import { Appearance, ScrollView, Alert, useColorScheme, View } from "react-native";

import SettingsCard from "@/components/settings/SettingsCard";
import SettingsItem from "@/components/settings/SettingsItem";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { auth } from "@/FirebaseConfig";
import useAuthStore from "@/lib/authStore";
import { signOut, deleteUser, sendPasswordResetEmail } from "firebase/auth";
import Toast from "react-native-toast-message";

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
          leftIcon={<KeyRound size={18} />}
          onPress={handleChangePassword}
        />
        <View className="h-px bg-border/50 mx-4" />

        <SettingsItem
          label="Linked Accounts"
          leftIcon={<Link2 size={18} color={theme.foreground} />}
          onPress={() => {}}
        />
        <View className="h-px bg-border/50 mx-4" />


       <Link href="/SettingsScreen/notification-preferences" asChild>
         <SettingsItem
           label="Notification Preferences"
           leftIcon={<Bell size={18} color={theme.foreground} />}
         />
       </Link>

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
          onPress={confirmAndDelete}

        />
      </SettingsCard>

      <Button variant="secondary" onPress={() => signOut(auth)}>
        <Text>Sign Out</Text>
      </Button>
    </ScrollView>
  );
}
