async function getNewAccessToken(refreshToken = null) {
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
  return data.access_token;
}

async function fetchWithRefresh(url, options = {}, retry = true) {
  const accessToken = window.localStorage.getItem("access_token");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // トークンが切れてるとき
  if (res.status === 401 && retry) {
    console.warn("トークン切れ検知 → 再取得して再実行");

    try {
      const newToken = await getNewAccessToken();
      if (!newToken) throw new Error("トークン再取得できなかった");

      // 再試行（1回限り）
      return fetchWithRefresh(url, options, false);
    } catch (err) {
      console.error("トークン再取得失敗:", err);
      throw new Error("TOKEN_REFRESH_FAILED");
    }
  }

  if (!res.ok) {
    console.error(`Fetch失敗: ${res.status} ${res.statusText}`);
  }

  return res;
}

async function saveRefreshToken(refreshToken) {
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

async function getRefreshToken() {
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

export async function initSpotifyPlayer(setPlayer, setDeviceId, setToken) {
  const DEFAULT_VOLUME = 0.3;
  const newToken = await getNewAccessToken();
  setToken(newToken);

  await loadSpotifySDK();

  return new Promise((resolve) => {
    const playerInstance = new window.Spotify.Player({
      name: "MyMusicPlayer",
      getOAuthToken: (cb) => {
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

async function isValidToken(localAccessToken) {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${localAccessToken}` },
    });

    if (response.ok) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function loadSpotifySDK() {
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

let lastDeviceCheckTime = 0;
let cachedDeviceId = null;
const DEVICE_CHECK_INTERVAL = 30 * 1000;

export async function validateDeviceId(currentDeviceId, setPlayer, setDeviceId, setToken) {
  const now = Date.now();

  if (cachedDeviceId && now - lastDeviceCheckTime < DEVICE_CHECK_INTERVAL) {
    return cachedDeviceId;
  }

  const response = await fetchWithRefresh("https://api.spotify.com/v1/me/player/devices");
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

export { getNewAccessToken, fetchWithRefresh, saveRefreshToken, getRefreshToken, isValidToken };
