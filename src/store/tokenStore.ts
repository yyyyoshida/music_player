import { create } from "zustand";

type TokenStore = {
  token: string | null;
  isToken: boolean;

  setToken: (token: string | null) => void;
  setIsToken: (isToken: boolean) => void;
};

const useTokenStore = create<TokenStore>((set) => ({
  token: localStorage.getItem("access_token"),
  isToken: false,

  setToken: (token) => set({ token }),
  setIsToken: (isToken) => set({ isToken }),
}));

export default useTokenStore;
