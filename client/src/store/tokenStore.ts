import { create } from "zustand";
import { STORAGE_KEYS } from "../utils/storageKeys";

type TokenStore = {
  token: string | null;
  isToken: boolean;

  setToken: (token: string | null) => void;
  setIsToken: (isToken: boolean) => void;
};

const useTokenStore = create<TokenStore>((set) => ({
  token: localStorage.getItem(STORAGE_KEYS.TOKEN),
  isToken: false,

  setToken: (token) => set({ token }),
  setIsToken: (isToken) => set({ isToken }),
}));

export default useTokenStore;
