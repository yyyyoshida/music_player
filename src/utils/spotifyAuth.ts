import { API } from "../api/apis";

export async function getNewAccessToken(refreshToken: string | null = null): Promise<string> {
  const tokenToUse = refreshToken || window.localStorage.getItem("refresh_token");

  const response = await fetch(API.NEW_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: tokenToUse }),
  });

  if (!response.ok) {
    throw new Error("アクセストークンの更新に失敗しました");
  }

  const data = await response.json();
  window.localStorage.setItem("access_token", data.access_token);

  if (data.refresh_token) {
    window.localStorage.setItem("refresh_token", data.refresh_token);
  }

  if (data.expires_in) {
    const expiryTime = Date.now() + data.expires_in * 1000;
    window.localStorage.setItem("access_token_expiry", expiryTime.toString());
  }
  return data.access_token;
}

export async function saveRefreshToken(refreshToken: string): Promise<void> {
  const res = await fetch(API.SAVE_REFRESH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    throw new Error("リフレッシュトークン保存に失敗");
  }
  await res.json();
}

export async function getRefreshToken(): Promise<string> {
  const res = await fetch(API.NEW_REFRESH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    throw new Error("リフレッシュトークン取得に失敗");
  }
  const data = await res.json();
  return data.refresh_token;
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;
export function isValidToken() {
  const expiryString = window.localStorage.getItem("access_token_expiry");
  if (!expiryString) return false;

  const expiry = Number(expiryString);
  return Date.now() < expiry - FIVE_MINUTES_MS;
}

// Spotify API系の通信はこのトークン切れ更新付きのこの関数で行う。↙
export async function fetchSpotifyAPI(url: string, options: RequestInit = {}): Promise<Response> {
  let token = window.localStorage.getItem("access_token");
  console.log("トークンは有効かどうか：", isValidToken());

  if (!isValidToken()) {
    try {
      token = await getNewAccessToken();
      if (!token) throw new Error("トークン再取得できなかった");
    } catch (error) {
      console.error("トークン再取得失敗:", error);
      throw new Error("TOKEN_REFRESH_FAILED");
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  return response;
}

function loadSpotifySDK() {
  return new Promise((resolve, reject) => {
    if (window.Spotify) return resolve(window.Spotify);

    window.onSpotifyWebPlaybackSDKReady = () => {
      resolve(window.Spotify);
    };

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => reject(new Error("Spotify SDK の読み込みに失敗"));
    document.body.appendChild(script);
  });
}

type Setter<T> = (value: T) => void;

type SpotifyInitArgs = {
  setPlayer: Setter<Spotify.Player>;
  setDeviceId: Setter<string>;
  setToken: Setter<string>;
};

export async function initSpotifyPlayer({
  setPlayer,
  setDeviceId,
  setToken,
}: SpotifyInitArgs): Promise<{ playerInstance: Spotify.Player }> {
  const DEFAULT_VOLUME = 0.3;
  const currentToken = window.localStorage.getItem("access_token");

  await loadSpotifySDK();

  return new Promise((resolve) => {
    const playerInstance = new window.Spotify.Player({
      name: "MyMusicPlayer",
      getOAuthToken: async (cb) => {
        if (!isValidToken() || !currentToken) {
          const newToken = await getNewAccessToken();
          setToken(newToken);

          cb(newToken);
          return;
        }

        setToken(currentToken);
        cb(currentToken);
      },
      volume: DEFAULT_VOLUME,
    });

    playerInstance.addListener("ready", ({ device_id }) => {
      setDeviceId(device_id);
      resolve({ playerInstance });
    });

    playerInstance.connect();
    setPlayer(playerInstance);
  });
}
