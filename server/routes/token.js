const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

const CLIENT_ID = process.env.SPOTIFY_API_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_API_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// トークン交換エンドポイント
router.post("/exchange_token", async (req, res) => {
  console.log("トークン交換エンドポイント");

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
router.post("/refresh_token", async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: "refresh_token is required" });

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
    console.log(data);

    if (!response.ok) {
      console.error("リフレッシュ失敗:", data);
      return res.status(response.status).json(data);
    }

    console.log("localStorageのリフレッシュトークンを使って更新");
    // return res.json({ access_token: data.access_token });
    return res.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error("内部エラー:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// トークン保存
router.post("/save_refresh_token", async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: "refresh_token required" });

  try {
    await db.collection("users").doc("only_user").set({ refresh_token }, { merge: true });
    console.log("DBにrefresh_tokenを保存");
    res.json({ message: "refresh_token保存完了" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// トークン取得
router.post("/get_refresh_token", async (req, res) => {
  try {
    const docs = await db.collection("users").limit(1).get();
    if (docs.empty) return res.status(404).json({ error: "トークンが見つかりません" });

    const doc = docs.docs[0];
    console.log("DBからrefresh_tokenを取得");
    res.json({ refresh_token: doc.data().refresh_token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

module.exports = router;
