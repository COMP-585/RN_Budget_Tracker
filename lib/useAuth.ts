import { auth } from "@/FirebaseConfig";
import useAuthStore from "@/lib/authStore";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect } from "react";

export const useAuth = () => {
  const { setUser, setLoading, setToken } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        setUser(user);
        const token = await user.getIdToken();
        setToken(token);
        console.info("Logged in");
      } else {
        setToken(null);
        setUser(null);
        console.info("Logged out");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, setToken]);

  return useAuthStore();
};
