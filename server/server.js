var admin = require("firebase-admin");
var serviceAccount = require("./my-music-player-8ae45-firebase-adminsdk-fbsvc-149eac64fa.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ローカルサーバーは立ち上がってる！！");
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

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

// トークン保存
app.post("/api/save_refresh_token", async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: "userId and refresh_token required" });
  }

  try {
    await db.collection("users").doc("only_user").set({ refresh_token }, { merge: true });
    res.json({ message: "リフレッシュトークン保存完了" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// トークン取得
app.post("/api/get_refresh_token", async (req, res) => {
  try {
    const docs = await db.collection("users").limit(1).get();
    if (docs.empty) {
      return res.status(404).json({ error: "トークンが見つかりません" });
    }

    const doc = docs.docs[0];
    res.json({ refresh_token: doc.data().refresh_token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// プレイリスト取得
app.get("/api/playlists", async (req, res) => {
  try {
    const playlistsRef = db.collection("playlists");
    const playlistSnapshot = await playlistsRef.get();

    const playlists = await Promise.all(
      playlistSnapshot.docs.map(async (doc) => {
        const playlistId = doc.id;
        const tracksSnapshot = await playlistsRef.doc(playlistId).collection("tracks").get();
        const tracks = tracksSnapshot.docs.map((doc) => doc.data());
        const tracksSortedByOldest = tracks.slice().sort((a, b) => a.addedAt?.seconds - b.addedAt?.seconds);
        const firstFourAlbumImages = tracksSortedByOldest.slice(0, 4).map((track) => track.albumImage);

        return {
          id: playlistId,
          ...doc.data(),
          trackCount: tracksSnapshot.size,
          albumImages: firstFourAlbumImages,
        };
      })
    );

    res.json(playlists);
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).json({ error: "データ取得失敗" });
  }
});
