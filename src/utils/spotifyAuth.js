const getNewAccessToken = async () => {
  const refreshToken = window.localStorage.getItem("refresh_token");
  console.log("spotifyAuth側refreshToken：", cutText(refreshToken));

  const response = await fetch("http://localhost:4000/api/refresh_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
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
};
export { getNewAccessToken };

function cutText(text) {
  return text.substring(0, 20);
}
