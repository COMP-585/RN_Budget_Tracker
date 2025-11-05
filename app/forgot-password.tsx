import { auth } from "@/FirebaseConfig"; // make sure this points to your Firebase setup
import { THEME } from "@/lib/theme";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";

export default function ForgotPasswordScreen() {
  const { colorScheme } = useColorScheme();
  const colors = THEME[colorScheme ?? "light"];
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const { user, loading } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
        alert("Please enter your email address.");
        return;
      }

      try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent! Check your inbox.");
        router.replace("/"); // optional: take user back to login
      } catch (error: any) {
        console.error("Password reset error:", error);
        if (error.code === "auth/user-not-found") {
          alert("No account found with this email.");
        } else if (error.code === "auth/invalid-email") {
          alert("Invalid email address format.");
        } else {
          alert("Something went wrong. Please try again later.");
        }
      }
    console.log("Reset password for:", email);
  };

  return (
        <KeyboardAvoidingView
          style={[styles.container, { backgroundColor: theme.background }]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo or Welcome Section */}
            <View style={styles.logoContainer}>
              {/* Placeholder image (replace source with your own logo later) */}
              <Image
                source={require("assets/images/splash-icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.welcomeText, { color: theme.foreground }]}>
                Welcome to DriveDough
              </Text>
            </View>

            <View style={styles.dialogueBox}>
              <Text style={[styles.forgotText, { color: theme.foreground }, { fontSize: 28 }]}>
                Forgot your password?
              </Text>
              <Text style={[styles.forgotText, { color: theme.foreground }]}>
                Please enter the email for the account you&apos;d like to recover
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.tab]}
              >
                <Text style={[styles.buttonText, { color: theme.primary }]}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
    
            {/* Form */}
            <View style={styles.form}>
              <TextInput
                style={[ styles.input, 
                  { borderColor: theme.input, color: theme.foreground, backgroundColor: theme.card }]}
                placeholder="Email"
                placeholderTextColor={theme.mutedForeground}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </ScrollView>
    
          {/* Floating action button */}
          <TouchableOpacity
            style={[styles.floatingButton, { backgroundColor: theme.primary }]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: theme.primaryForeground }]}>
              {"Reset"}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingBottom: 100,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "700",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
    borderBottomWidth: 1,
  },
  tab: {
    marginHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 18,
    fontWeight: "600",
  },
  dialogueBox: {
    backgroundColor: "#202020ff",
    borderRadius: 20,
  },
  form: {
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  forgotContainer: {
    alignItems: "flex-end",
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "500",
    marginBlock: 14,
    marginInline: 14
  },
  floatingButton: {
    position: "absolute",
    bottom: 40,
    right: 24,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});