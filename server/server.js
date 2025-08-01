var admin = require("firebase-admin");
var serviceAccount = require("./my-music-player-8ae45-firebase-adminsdk-fbsvc-149eac64fa.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // storageBucket: "my-music-player-8ae45.appspot.com",
  storageBucket: "my-music-player-8ae45.firebasestorage.app",
});

const bucket = admin.storage().bucket();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const sharp = require("sharp");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

const db = admin.firestore();

require("dotenv").config();

app.get("/", (req, res) => {
  res.send("ローカルサーバーは立ち上がってる！！");
});

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

// プレイリスト一覧取得
app.get("/api/playlists", async (req, res) => {
  try {
    const playlistsRef = db.collection("playlists").orderBy("createdAt", "asc");
    const playlistSnapshot = await playlistsRef.get();

    const playlists = await Promise.all(
      playlistSnapshot.docs.map(async (doc) => {
        const playlistId = doc.id;
        const tracksSnapshot = await db.collection("playlists").doc(playlistId).collection("tracks").get();
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

// プレイリストのメタ情報取得
app.get("/api/playlists/:id/info", async (req, res) => {
  try {
    const playlistId = req.params.id;
    const playlistRef = db.collection("playlists").doc(playlistId);
    const playlistSnapshot = await playlistRef.get();
    const data = playlistSnapshot.data();
    const responseData = {
      name: data.name,
      totalDuration: data.totalDuration,
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
    };

    res.json(responseData);
  } catch (error) {
    console.error("エラー", error);
    res.status(500).json({ error: "プレイリストのメタ情報取得失敗" });
  }
});

// プレイリストのトラック取得
app.get("/api/playlists/:id/tracks", async (req, res) => {
  try {
    const playlistId = req.params.id;
    const tracksRef = db.collection("playlists").doc(playlistId).collection("tracks");
    const tracksSnapshot = await tracksRef.get();
    const tracks = tracksSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...doc.data(),
        addedAt: data.addedAt ? data.addedAt.toDate().toISOString() : null,
      };
    });

    res.json(tracks);
  } catch (error) {
    console.error("エラー", error);
    res.status(500).json({ error: "トラック取得失敗" });
  }
});

// プレイリスト新規作成
const MAX_NAME_LENGTH = 10;

function validatePlaylistName(name) {
  if (typeof name !== "string") return "名前は文字列である必要があります";

  const trimmedName = name.trim();
  const nameLength = countNameLength(trimmedName);

  if (!trimmedName) return "名前を入力してください";
  if (nameLength > MAX_NAME_LENGTH) return "文字数オーバーです";

  return null;
}

function countNameLength(string) {
  let nameLength = 0;
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    nameLength += code <= 0x007f ? 0.5 : 1;
  }
  return nameLength;
}

app.post("/api/playlists", async (req, res) => {
  const { name } = req.body;

  const error = validatePlaylistName(name);
  if (error) return res.status(400).json({ error });

  try {
    const playlistRef = await db.collection("playlists").add({
      name: name.trim(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ playlistId: playlistRef.id });
  } catch (error) {
    console.error("プレイリスト作成失敗", error);
    res.status(500).json({ error: "プレイリスト作成失敗" });
  }
});
//========================
// プレイリストに曲を追加
//========================

// Spotify曲のプレイリストに追加
app.post("/api/playlists/:id/spotify-tracks", async (req, res) => {
  // Spotify API由来だからデータ信頼性があるのでバリデーションは書いてない
  try {
    const playlistId = req.params.id;
    const track = req.body;
    const playlistRef = db.collection("playlists").doc(playlistId);

    const newTrackRef = await playlistRef.collection("tracks").add({
      ...track,
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const newTrackSnapshot = await newTrackRef.get();
    const addedTrack = { id: newTrackRef.id, ...newTrackSnapshot.data() };

    await playlistRef.update({
      totalDuration: admin.firestore.FieldValue.increment(Number(track.duration_ms)),
    });

    res.status(200).json({ addedTrack });
  } catch (error) {
    console.error("プレイリストに追加失敗", error);
    res.status(500).json({ error: "プレイリストに追加失敗" });
  }
});

// プレイリストにあるローカル曲を他のプレイリストに追加
app.post("/api/playlists/:id/local-tracks", async (req, res) => {
  try {
    const playlistId = req.params.id;
    const track = req.body;
    const playlistRef = db.collection("playlists").doc(playlistId);

    const newTrackRef = await playlistRef.collection("tracks").add({
      title: track.title,
      artist: track.artist,
      duration_ms: track.duration_ms,
      albumImage: track.albumImage,
      albumImagePath: track.albumImagePath,
      audioURL: track.audioURL,
      audioPath: track.audioPath,
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      source: "local",
    });

    const newTrackSnapshot = await newTrackRef.get();
    const addedTrack = { id: newTrackRef.id, ...newTrackSnapshot.data() };

    await playlistRef.update({
      totalDuration: admin.firestore.FieldValue.increment(Number(track.duration_ms)),
    });

    res.status(200).json({ addedTrack });
  } catch (error) {
    console.error("プレイリストに追加(ローカル曲)失敗", error);
    res.status(500).json({ error: "プレイリストに追加（ローカル）失敗" });
  }
});

// PCからローカル曲をプレイリストに追加
// 備忘録 Date.now()はバッティング防止

// 音声ファイルをStorageにアップロードしてURLとパスを返す
async function uploadAudio(fileBuffer, title) {
  const fileName = `tracks/${title}_${Date.now()}.mp3`;
  const storageFile = bucket.file(fileName);

  await storageFile.save(fileBuffer, {
    metadata: { contentType: "audio/mpeg" },
    public: true,
  });

  await storageFile.makePublic();

  const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

  console.log("アップロード完了:", url);
  return { audioURL: url, audioPath: fileName };
}

// 画像もあればアップロードしてURLとパスを返す
const FALLBACK_COVER_IMAGE = "http://localhost:3000/img/fallback-cover.png";

async function uploadImage(imageFile) {
  if (!imageFile || !imageFile.buffer || !imageFile.mimetype.startsWith("image/")) {
    return { albumImageURL: FALLBACK_COVER_IMAGE, albumImagePath: null };
  }

  const fileName = `covers/${imageFile.originalname}_${Date.now()}.webp`;
  const webpBuffer = await sharp(imageFile.buffer).resize(500).webp({ quality: 80 }).toBuffer();
  const storageFile = bucket.file(fileName);

  await storageFile.save(webpBuffer, {
    metadata: {
      contentType: "image/webp",
      cacheControl: "public,max-age=86400",
    },
    public: true,
  });

  await storageFile.makePublic();

  const albumImageURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

  return { albumImageURL, albumImagePath: fileName };
}

app.post("/api/playlists/:id/local-tracks/new", upload.fields([{ name: "audio" }, { name: "cover" }]), async (req, res) => {
  if (!req.files?.audio?.length) return res.status(400).json({ error: "音声ファイルが見つかりません" });

  try {
    const playlistId = req.params.id;
    const track = JSON.parse(req.body.track);
    const audioFile = req.files.audio[0];
    const coverFile = req.files.cover?.[0] ?? null;
    const playlistRef = db.collection("playlists").doc(playlistId);

    const [audioResult, imageResult] = await Promise.all([uploadAudio(audioFile.buffer, track.title), uploadImage(coverFile)]);

    const newTrackRef = await playlistRef.collection("tracks").add({
      title: track.title,
      artist: track.artist,
      duration_ms: track.duration_ms,
      albumImage: imageResult.albumImageURL,
      albumImagePath: imageResult.albumImagePath,
      audioURL: audioResult.audioURL,
      audioPath: audioResult.audioPath,
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      source: "local",
    });

    const newTrackSnapshot = await newTrackRef.get();
    const addedTrack = { id: newTrackRef.id, ...newTrackSnapshot.data() };

    await playlistRef.update({
      totalDuration: admin.firestore.FieldValue.increment(Number(track.duration_ms)),
    });

    res.status(200).json({ addedTrack });
  } catch (error) {
    console.error("PCからプレイリストに追加失敗", error);
    res.status(500).json({ error: "PCからプレイリストに追加失敗" });
  }
});

//=======================
// プレイリストの楽曲削除
//=======================

async function deleteFile(path) {
  if (!path) return;
  try {
    await bucket.file(path).delete();
  } catch (error) {
    console.warn(`ファイル削除失敗: ${path}`, error.message);
  }
}

app.delete("/api/playlists/:playlistId/tracks/:trackId", async (req, res) => {
  const { playlistId, trackId } = req.params;

  try {
    const playlistRef = db.collection("playlists").doc(playlistId);
    const trackRef = playlistRef.collection("tracks").doc(trackId);
    console.log("playlistId:", playlistId);
    console.log("trackId:", trackId);

    const trackSnapshot = await trackRef.get();
    console.log("trackSnapshot.exists:", trackSnapshot.exists);
    if (!trackSnapshot.exists) {
      return res.status(404).json({ error: "Track not found" });
    }

    const deletedTrack = trackSnapshot.data();

    await deleteFile(deletedTrack.albumImagePath);
    await deleteFile(deletedTrack.audioPath);
    await trackRef.delete();

    await playlistRef.update({
      totalDuration: admin.firestore.FieldValue.increment(-deletedTrack.duration_ms),
    });

    res.status(200).json({ deletedTrack });
  } catch (error) {
    console.error("楽曲削除失敗", error);
    res.status(500).json({ error: "楽曲削除失敗" });
  }
});
