import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { auth } from "@/FirebaseConfig";
import useAuthStore from "@/lib/authStore";
import { Image as ExpoImage } from "expo-image";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text as RNText,
  ScrollView,
  TextInput,
  View,
} from "react-native";

const isLikelyPublicImage = (u: string) =>
  /^https:\/\/.+/i.test((u ?? "").trim());

export default function EditProfile() {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? "");
  const [saving, setSaving] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Preview of the text field value (with cache-buster)
  const previewUri = useMemo(() => {
    const u = (photoURL ?? "").trim();
    if (!u) return "";
    const sep = u.includes("?") ? "&" : "?";
    return `${u}${sep}cb=${Date.now()}`;
  }, [photoURL]);

  // Shows current user.photoURL (with cache-buster)
  const userHeaderUri = useMemo(() => {
    const u = (user?.photoURL ?? "").trim();
    if (!u) return "";
    const sep = u.includes("?") ? "&" : "?";
    return `${u}${sep}cb=${Date.now()}`;
  }, [user?.photoURL]);

  const onSave = async () => {
    if (!auth?.currentUser) return Alert.alert("Not signed in");

    if (photoURL && !isLikelyPublicImage(photoURL)) {
      return Alert.alert("Invalid URL", "Use a public HTTPS image URL.");
    }

    try {
      setSaving(true);
      let usedWebSdk = false;
      try {
        const { updateProfile } = await import("firebase/auth");
        await updateProfile(auth.currentUser as any, {
          displayName: displayName.trim() || null,
          photoURL: photoURL.trim() || null,
        });
        usedWebSdk = true;
      } catch {
        // @react-native-firebase/auth
        // @ts-ignore
        if (typeof auth.currentUser?.updateProfile === "function") {
          // @ts-ignore
          await auth.currentUser.updateProfile({
            displayName: displayName.trim() || undefined,
            photoURL: photoURL.trim() || undefined,
          });
        } else {
          throw new Error("updateProfile not available on current SDK");
        }
      }

      // Reload to ensure auth.currentUser has fresh values
      // @ts-ignore
      if (typeof auth.currentUser?.reload === "function") {
        // @ts-ignore
        await auth.currentUser.reload();
      }

      // Push the updated user into Zustand so Settings reads the new photoURL
      setUser(auth.currentUser as any);
      setPreviewError(null);
      Alert.alert("Success", "Profile updated");
    } catch (e: any) {
      Alert.alert("Update failed", e?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  // White text for inputs (NativeWind sometimes doesn’t apply to TextInput)
  const inputStyle = { color: "#fff" } as const;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="px-5 py-6 gap-6 pb-24"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Current avatar (from user.photoURL) */}
        <View className="items-center gap-2">
          <Text className="text-sm text-muted-foreground">Current avatar</Text>
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center overflow-hidden">
            {userHeaderUri ? (
              <ExpoImage
                key={userHeaderUri}
                source={{ uri: userHeaderUri }}
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
              <View className="w-full h-full" />
            )}
          </View>
        </View>

        {/* Live preview of NEW URL */}
        <View className="items-center gap-2">
          <Text className="text-sm text-muted-foreground">
            Preview of the NEW URL below
          </Text>
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center overflow-hidden">
            {previewUri ? (
              <ExpoImage
                key={previewUri}
                source={{ uri: previewUri }}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 9999,
                  backgroundColor: "#eee",
                }}
                contentFit="cover"
                cachePolicy="none"
                onError={() => setPreviewError("Image failed to load")}
              />
            ) : (
              <View className="w-full h-full" />
            )}
          </View>
          {previewError ? (
            <RNText style={{ color: "red", fontSize: 12 }}>
              {previewError}
            </RNText>
          ) : null}
        </View>

        {/* Display Name */}
        <View className="gap-2">
          <Text variant="muted">Display Name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            autoCapitalize="words"
            className="border border-border rounded-xl px-3 py-2"
            style={inputStyle}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Photo URL */}
        <View className="gap-2">
          <Text variant="muted">Photo URL (HTTPS)</Text>
          <TextInput
            value={photoURL}
            onChangeText={(t) => {
              setPreviewError(null);
              setPhotoURL(t);
            }}
            placeholder="https://i.pravatar.cc/300"
            autoCapitalize="none"
            autoCorrect={false}
            className="border border-border rounded-xl px-3 py-2"
            style={inputStyle}
            placeholderTextColor="#9CA3AF"
          />
          <RNText style={{ fontSize: 12, color: "#6b7280" }}>
            Try: https://randomuser.me/api/portraits/men/32.jpg or a GitHub
            avatar like https://avatars.githubusercontent.com/u/1?v=4
          </RNText>
        </View>

        <Button onPress={onSave} disabled={saving}>
          <Text>{saving ? "Saving..." : "Save Changes"}</Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
