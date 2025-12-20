import { create } from "zustand";
import { STORAGE_KEYS } from "../utils/storageKeys";

type ServerStatus = "ready" | "checking" | "login-required";

type TokenStore = {
  token: string | null;
  isToken: boolean;
  serverStatus: ServerStatus;

  setToken: (token: string | null) => void;
  setIsToken: (isToken: boolean) => void;
  setServerStatus: (status: ServerStatus) => void;
};

const useTokenStore = create<TokenStore>((set) => ({
  token: localStorage.getItem(STORAGE_KEYS.TOKEN),
  isToken: false,
  serverStatus: "ready",

  setToken: (token) => set({ token }),
  setIsToken: (isToken) => set({ isToken }),
  setServerStatus: (serverStatus) => set({ serverStatus }),
}));

export default useTokenStore;
