function cutText(text) {
  if (!text) return;
  return text.substring(0, 20);
}

async function getNewAccessToken(refreshToken) {
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

export { getNewAccessToken, fetchWithRefresh, saveRefreshToken, getRefreshToken };
