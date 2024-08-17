// src/store/authStore.ts
import { User } from "firebase/auth";
import { DocumentData } from "firebase/firestore";
import { create } from "zustand";
interface AuthState {
  user: DocumentData | null;
  setUser: (user: DocumentData | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export default useAuthStore;
