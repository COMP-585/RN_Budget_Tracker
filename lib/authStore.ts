import { User } from "firebase/auth";
import { create } from "zustand";
import { devtools } from "@csark0812/zustand-expo-devtools";

interface IAuth {
  user: User | null;
  loading: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string | null) => void;
}

const useAuthStore = create<IAuth>()(
  devtools((set) => ({
    user: null,
    loading: true,
    token: null,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    setToken: (token) => set({ token }),
  }))
);

export default useAuthStore;
