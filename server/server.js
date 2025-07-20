const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_API_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_API_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/";

// トークン交換エンドポイント

app.post("/api/exchange_token", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "code is required" });

  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("トークン交換失敗:", data);
      return res.status(response.status).json(data);
    }

    return res.json(data);
  } catch (error) {
    console.error("内部エラー:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// リフレッシュトークンエンドポイント

app.post("/api/refresh_token", async (req, res) => {
  const { refresh_token } = req.body;
  console.log("server.js側refreshToken：", refresh_token);

  if (!refresh_token) {
    return res.status(400).json({ error: "refresh_token is required" });
  }

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refresh_token);

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("リフレッシュ失敗:", data);
      return res.status(response.status).json(data);
    }

    return res.json({ access_token: data.access_token });
  } catch (error) {
    console.error("内部エラー:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ブラウザでアクセスした時

app.get("/", (req, res) => {
  res.send("🎧 Spotify API Server is running!");
});

// サーバー起動時

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
