export async function getNewAccessToken(refreshToken = null) {
  const tokenToUse = refreshToken || window.localStorage.getItem("refresh_token");

  const response = await fetch("http://localhost:4000/api/refresh_token", {
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
    window.localStorage.setItem("access_token_expiry", expiryTime);
  }
  return data.access_token;
}

export async function saveRefreshToken(refreshToken) {
  const res = await fetch("http://localhost:4000/api/save_refresh_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    throw new Error("リフレッシュトークン保存に失敗");
  }
  return await res.json();
}

export async function getRefreshToken() {
  const res = await fetch("http://localhost:4000/api/get_refresh_token", {
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
  const expiry = window.localStorage.getItem("access_token_expiry");

  if (!expiry) return false;

  return Date.now() < expiry - FIVE_MINUTES_MS;
}

// Spotify API系の通信はこのトークン切れ更新付きのこの関数で行う。↙
export async function fetchSpotifyAPI(url, options = {}) {
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

  if (!response.ok) {
    console.error(`Fetch失敗: ${response.status} ${response.statusText}`);
  }

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

export async function initSpotifyPlayer(setPlayer, setDeviceId, setToken) {
  const DEFAULT_VOLUME = 0.3;

  await loadSpotifySDK();

  return new Promise((resolve) => {
    const playerInstance = new window.Spotify.Player({
      name: "MyMusicPlayer",
      getOAuthToken: async (cb) => {
        const newToken = await getNewAccessToken();
        setToken(newToken);

        cb(newToken);
      },
      volume: DEFAULT_VOLUME,
    });

    playerInstance.addListener("ready", ({ device_id }) => {
      setDeviceId(device_id);
      resolve({ playerInstance, deviceId: device_id });
    });

    playerInstance.connect();
    setPlayer(playerInstance);
  });
}

let lastDeviceCheckTime = 0;
let cachedDeviceId = null;
const DEVICE_CHECK_INTERVAL = 30 * 1000;

export async function validateDeviceId(currentDeviceId, setPlayer, setDeviceId, setToken) {
  const now = Date.now();

  if (cachedDeviceId && now - lastDeviceCheckTime < DEVICE_CHECK_INTERVAL) {
    return cachedDeviceId;
  }

  const response = await fetchSpotifyAPI("https://api.spotify.com/v1/me/player/devices");
  if (!response.ok) return null;

  const data = await response.json();
  const isStillAlive = data.devices.some((d) => d.id === currentDeviceId);

  lastDeviceCheckTime = now;
  cachedDeviceId = isStillAlive ? currentDeviceId : null;

  if (isStillAlive) {
    return currentDeviceId;
  }
  // デバイスIDが無効だった場合の処理↓↓
  try {
    const { deviceId } = await initSpotifyPlayer(setPlayer, setDeviceId, setToken);

    return deviceId;
  } catch (err) {
    console.error("Spotify Player接続失敗:", err);
    return null;
  }
}
