import { create } from "zustand";

const useTokenStore = create((set) => ({
  token: localStorage.getItem("access_token"),
  isToken: false,

  setToken: (token) => set({ token }),
  setIsToken: (isToken) => set({ isToken }),
}));

export default useTokenStore;
