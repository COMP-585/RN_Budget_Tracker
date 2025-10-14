import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const [showPassword, setShowPassword] = useState(true);

  const handleShowPassword = () => {
    setShowPassword((prev: boolean) => !prev);
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <Text variant={"h1"}>Sign Up Page</Text>
      <View style={styles.inputContainer}>
        <View style={styles.namesContainer}>
          <Input placeholder="First Name"></Input>
          <Input placeholder="Last Name"></Input>
        </View>
        <Input
          placeholder="Email"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        ></Input>
        <View style={styles.passwordContainer}>
          <Input
            style={styles.passwordInput}
            placeholder="Password"
            keyboardType="visible-password"
            autoComplete="password-new"
            textContentType="password"
            secureTextEntry={showPassword}
          ></Input>
          <Pressable onPress={handleShowPassword} style={styles.eyeIcon}>
            {showPassword ? (
              <EyeOff size={20} color="gray" />
            ) : (
              <Eye size={20} color="gray" />
            )}
          </Pressable>
        </View>
        <View style={styles.passwordContainer}>
          <Input
            style={styles.passwordInput}
            placeholder="Confirm Password"
            secureTextEntry={showPassword}
          ></Input>
          <Pressable onPress={handleShowPassword} style={styles.eyeIcon}>
            {showPassword ? (
              <EyeOff size={20} color="gray" />
            ) : (
              <Eye size={20} color="gray" />
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 10,
    gap: 16,
  },
  namesContainer: {
    flexDirection: "row",
    gap: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
  },
});
