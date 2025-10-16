import { auth } from "@/FirebaseConfig";
import { THEME } from "@/lib/theme";
import { useAuth } from "@/lib/useAuth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { user, loading } = useAuth();

  const signUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log(user);
    } catch (error: any) {
      console.log(error);
      alert("Sign up failed: " + error.message);
    } finally {
    }
  };

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log(user);
    } catch (error: any) {
      console.log(error);
      alert("Sign in failed: " + error.message);
    } finally {
    }
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

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab("login")}
            style={[
              styles.tab,
              {
                borderBottomColor:
                  activeTab === "login" ? theme.primary : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "login"
                      ? theme.primary
                      : theme.mutedForeground,
                },
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("signup")}
            style={[
              styles.tab,
              {
                borderBottomColor:
                  activeTab === "signup" ? theme.primary : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "signup"
                      ? theme.primary
                      : theme.mutedForeground,
                },
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.input,
                color: theme.foreground,
                backgroundColor: theme.card,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={theme.mutedForeground}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.input,
                color: theme.foreground,
                backgroundColor: theme.card,
              },
            ]}
            placeholder="Password"
            placeholderTextColor={theme.mutedForeground}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Forgot password button - only for Login */}
          {activeTab === "login" && (
            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() => console.log("Forgot Password pressed")}
            >
              <Text style={[styles.forgotText, { color: theme.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}

          {/* Confirm Password - only for Sign Up */}
          {activeTab === "signup" && (
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.input,
                  color: theme.foreground,
                  backgroundColor: theme.card,
                },
              ]}
              placeholder="Confirm Password"
              placeholderTextColor={theme.mutedForeground}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          )}
        </View>
      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: theme.primary }]}
        onPress={activeTab === "login" ? signIn : signUp}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: theme.primaryForeground }]}>
          {activeTab === "login" ? "Login" : "Sign Up"}
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
