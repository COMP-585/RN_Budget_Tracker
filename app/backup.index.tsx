import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LandingScreen() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <View className="gap-4 w-80">
        <Text variant={"h1"}>DriveDough</Text>
        <View className="flex flex-col gap-2">
          <Input
            placeholder="Email"
            textContentType="emailAddress"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            placeholder="Password"
            textContentType="password"
            autoComplete="password"
            secureTextEntry
          />
        </View>
        <View style={styles.btnContainer}>
          <Link href="/signup" push asChild>
            <Button style={styles.button}>
              <Text>Sign Up</Text>
            </Button>
          </Link>
          <Button variant={"secondary"} style={styles.button}>
            <Text>Log In</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  button: {
    flexGrow: 1,
  },
});
