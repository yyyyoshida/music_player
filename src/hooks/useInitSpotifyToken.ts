import { useEffect } from "react";
import { isValidToken, getNewAccessToken, getRefreshToken, saveRefreshToken } from "../utils/spotifyAuth";
import useTokenStore from "../store/tokenStore";
import { API } from "../api/apis";
import { STORAGE_KEYS } from "../utils/storageKeys";

const useInitSpotifyToken = (): void => {
  const setToken = useTokenStore((state) => state.setToken);
  const setIsToken = useTokenStore.getState().setIsToken;

  async function initTokenFromCache(): Promise<boolean> {
    const localAccessToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const localRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    // ローカルのトークンでログイン;
    if (localAccessToken && isValidToken()) {
      setToken(localAccessToken);
      return true;
    }

    // ローカルのリフレッシュトークンでログイン
    if (localRefreshToken) {
      try {
        const newToken = await getNewAccessToken();
        setToken(newToken);
        return true;
      } catch (error) {
        console.warn("ローカルリフレッシュ失敗(次の手段でログイン):", error);
      }
    }

    return false;
  }

  async function initTokenFromCode(): Promise<boolean> {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return false;

    try {
      const res = await fetch(API.EXCHANGE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.access_token);
        setToken(data.access_token);
      }

      if (data.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
        await saveRefreshToken(data.refresh_token);
      }

      window.history.replaceState({}, "", "/");
      return true;
    } catch (error) {
      console.warn("トークン交換失敗(次の手段でログイン):", error);
      return false;
    }
  }

  async function initTokenFromDB(): Promise<boolean> {
    try {
      const storedRefreshToken = await getRefreshToken();
      if (!storedRefreshToken) throw new Error("リフレッシュトークンがサーバーにない");

      const newToken = await getNewAccessToken(storedRefreshToken);
      setToken(newToken);
      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, storedRefreshToken);
      return true;
    } catch (error) {
      setIsToken(false);
      console.error("🔁 トークンの更新失敗 ログインしてください:", error);
      return false;
    }
  }

  useEffect(() => {
    (async () => {
      if (await initTokenFromCache()) return;
      if (await initTokenFromCode()) return;
      await initTokenFromDB();
    })();
  }, []);
};

export default useInitSpotifyToken;
