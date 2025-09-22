import { createContext, useState, useEffect } from "react";
import { fetchSpotifyAPI } from "../utils/spotifyAuth";
import useTokenStore from "../store/tokenStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const token = useTokenStore((state) => state.token);
  const setIsToken = useTokenStore((state) => state.setIsToken);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);
  const [profile, setProfile] = useState(null);

  async function fetchProfile() {
    try {
      const response = await fetchSpotifyAPI("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        console.error("プロフィール取得失敗: ", response.status);
        setIsToken(false);
        showMessage("fetchProfileFailed");
        return;
      }

      const data = await response.json();

      setProfile(data);
      setIsToken(true);
    } catch (error) {
      console.error("プロフィール取得失敗: ", error);
      setIsToken(false);
      showMessage("fetchProfileFailed");
    }
  }

  useEffect(() => {
    if (!token) return;
    console.log("useSpotify", token);

    fetchProfile();
  }, [token]);

  return <UserContext.Provider value={{ profile }}>{children}</UserContext.Provider>;
};
