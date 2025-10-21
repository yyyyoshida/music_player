import { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import { fetchSpotifyAPI } from "../utils/spotifyAuth";
import useTokenStore from "../store/tokenStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import { API } from "../api/apis";

type ImagesObject = {
  height: number;
  width: number;
  url: string;
};

type UserContextType = {
  profile: {
    images: ImagesObject[];
    display_name: string;
  } | null;
};

type UserProviderProps = {
  children: ReactNode;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: UserProviderProps) => {
  const token = useTokenStore((state) => state.token);
  const setIsToken = useTokenStore((state) => state.setIsToken);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);
  const [profile, setProfile] = useState<UserContextType["profile"]>(null);

  async function fetchProfile() {
    try {
      const response = await fetchSpotifyAPI(API.SPOTIFY_ME, {
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
      console.log(data);
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

export const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUserContextはUserProvider内で使用する必要があります");
  }
  return context;
};
