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
    // if (!res.ok) {
    console.warn("🔐 トークン切れ検知 → 再取得して再実行");

    try {
      const newToken = await getNewAccessToken();
      if (!newToken) throw new Error("トークン再取得できなかった");

      // 再試行（1回限り）
      return fetchWithRefresh(url, options, false);
    } catch (err) {
      console.error("❌ トークン再取得失敗:", err);
      throw err;
    }
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

export async function initSpotifyPlayer() {
  function setupPlayer(resolve) {
    const playerInstance = new window.Spotify.Player({
      name: "MyMusicPlayer",
      getOAuthToken: (cb) => cb(localStorage.getItem("access_token")),
      volume: 0.3,
    });

    playerInstance.addListener("ready", ({ device_id }) => resolve({ playerInstance, deviceId: device_id }));

    playerInstance.connect();
  }

  return new Promise((resolve) => {
    if (!window.Spotify) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      script.onload = () => setupPlayer(resolve);
      document.body.appendChild(script);
    } else {
      setupPlayer(resolve);
    }
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

export async function loadSpotifySDK() {
  return new Promise((resolve, reject) => {
    if (window.Spotify) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Spotify SDK の読み込みに失敗"));
    document.body.appendChild(script);
  });
}

export function createSpotifyPlayer({ getOAuthToken }) {
  return new window.Spotify.Player({
    name: "MyMusicPlayer",
    getOAuthToken,
    volume: 0.3,
  });
}

export async function validateDeviceId(currentDeviceId, player, setDeviceId) {
  const response = await fetchWithRefresh("https://api.spotify.com/v1/me/player/devices");
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const isStillAlive = data.devices.some((d) => d.id === currentDeviceId);
  if (isStillAlive) {
    return currentDeviceId;
  }

  // if (!player) {
  //   const { playerInstance, deviceId } = await initSpotifyPlayer();
  //   return deviceId;
  // }

  // const connected = await player.connect();
  // if (connected) {
  //   return new Promise((resolve) => {
  //     player.addListener("ready", ({ device_id }) => resolve(device_id));
  //   });
  // }

  // return null;

  return new Promise(async (resolve) => {
    await connectSpotifyPlayer(player, (newId) => {
      setDeviceId(newId);
      resolve(newId);
    });
  });
}

export async function getOAuthTokenFromStorage(cb, setToken) {
  const currentToken = localStorage.getItem("access_token");
  const localRefreshToken = localStorage.getItem("refresh_token");

  if (currentToken) {
    cb(currentToken);
    return;
  }

  if (!localRefreshToken) {
    console.error("リフレッシュトークンがないよ");
    cb("");
    return;
  }

  try {
    const newToken = await getNewAccessToken(localRefreshToken);
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
    cb(newToken);
  } catch (err) {
    console.error("❌ getOAuthToken失敗:", err);
    cb("");
  }
}
//
export async function connectSpotifyPlayer(player, setDeviceId) {
  console.log("❌❌❌❌connectSpotifyPlayer発火");
  if (!player) {
    console.warn("player が null なので新規作成します");
    await initSpotifyPlayer();
  }

  if (!player) {
    console.error("❌ player が存在せず接続できない");
    return null;
  }

  const connected = await player.connect();
  if (!connected) {
    console.error("❌ Spotify Player 接続失敗");
    return null;
  }

  console.log("🎉 Spotify Player 接続成功");

  // すでに deviceId がセットされてる場合は即返す
  if (player._options && player._options.id) {
    console.log(`⚡ 既存 deviceId を返す: ${player._options.id}`);
    setDeviceId(player._options.id);
    return player._options.id;
  }

  // ready イベント待ち（古いリスナ削除してから追加）
  player.removeListener("ready");
  return new Promise((resolve) => {
    player.addListener("ready", ({ device_id }) => {
      console.log(`🎯 新しい deviceId を取得: ${device_id}`);
      setDeviceId(device_id);
      resolve(device_id);
    });
  });

  // return new Promise((resolve) => {
  //   player.addListener("ready", ({ device_id }) => {
  //     console.log(`🎯 新しい deviceId を取得: ${device_id}`);
  //     setDeviceId(device_id);
  //     resolve(device_id);
  //   });
  // });
}

export { getNewAccessToken, fetchWithRefresh, saveRefreshToken, getRefreshToken, isValidToken };
