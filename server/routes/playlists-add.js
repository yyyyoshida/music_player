const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const sharp = require("sharp");
const { admin, db, bucket } = require("../firebase");
const { validatePlaylistName } = require("../utils/playlistValidation");

//=====================
// プレイリスト新規作成
//=====================

router.post("/playlists", async (req, res) => {
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
router.post("/playlists/:id/spotify-tracks", async (req, res) => {
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
router.post("/playlists/:id/local-tracks", async (req, res) => {
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
// Date.now()はバッティング防止

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

router.post("/playlists/:id/local-tracks/new", upload.fields([{ name: "audio" }, { name: "cover" }]), async (req, res) => {
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

module.exports = router;
