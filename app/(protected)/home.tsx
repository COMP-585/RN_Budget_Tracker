import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { auth } from "@/FirebaseConfig";
import { useAuth } from "@/lib/useAuth";
import { signOut } from "firebase/auth";
import { View } from "react-native";

export default function HomeScreen() {
  const { loading } = useAuth();

  const logout = async () => {
    if (loading) return;
    try {
      await signOut(auth);
      console.log("Logged out successfully!");
    } catch (error) {
      console.log("Error with logging out: " + error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button onPress={logout}>
        <Text>Logout</Text>
      </Button>
    </View>
  );
}
