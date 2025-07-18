const CLIENT_ID = process.env.REACT_APP_SPOTIFY_API_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_API_CLIENT_SECRET;

const getNewAccessToken = async () => {
  const refreshToken = window.localStorage.getItem("refresh_token");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();

  if (data.access_token) {
    window.localStorage.setItem("access_token", data.access_token); // 新しいトークンを保存
    return data.access_token;
  }
  throw new Error("アクセストークンの更新に失敗しました");
};
export { getNewAccessToken };
