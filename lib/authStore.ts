import { User } from "firebase/auth";
import { create } from "zustand";

interface IAuth {
  user: User | null;
  loading: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string | null) => void;
}

const useAuthStore = create<IAuth>((set) => ({
  user: null,
  loading: true,
  token: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setToken: (token) => set({ token }),
}));

export default useAuthStore;
