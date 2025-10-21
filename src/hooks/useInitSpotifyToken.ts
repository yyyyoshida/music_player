import { useEffect } from "react";
import { isValidToken, getNewAccessToken, getRefreshToken, saveRefreshToken } from "../utils/spotifyAuth";
import useTokenStore from "../store/tokenStore";
import { API } from "../api/apis";

const useInitSpotifyToken = (): void => {
  const setToken = useTokenStore((state) => state.setToken);
  const setIsToken = useTokenStore((state) => state.setIsToken);

  async function initTokenFromCache(): Promise<boolean> {
    const localAccessToken = localStorage.getItem("access_token");
    const localRefreshToken = localStorage.getItem("refresh_token");

    // ローカルのトークンでログイン;
    if (localAccessToken && isValidToken()) {
      setToken(localAccessToken);
      console.log("ローカルToken");
      return true;
    }

    // ローカルのリフレッシュトークンでログイン
    if (localRefreshToken) {
      try {
        const newToken = await getNewAccessToken();
        setToken(newToken);
        console.log("ローカルrefresh");
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
        localStorage.setItem("access_token", data.access_token);
        setToken(data.access_token);
      }

      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
        await saveRefreshToken(data.refresh_token);
      }

      window.history.replaceState({}, "", "/");
      console.log("code");
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
      localStorage.setItem("access_token", newToken);
      localStorage.setItem("refresh_token", storedRefreshToken);
      console.log("DB");
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
