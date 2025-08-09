require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");

const { db, bucket } = require("./firebase");
const tokenRouter = require("./routes/token");
const upload = multer({ storage: multer.memoryStorage() });
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("ローカルサーバー立ち上がってるお(・ω・)ノ！！");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

app.use("/api", tokenRouter);

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
    const tracksRef = db.collection("playlists").doc(playlistId).collection("tracks").orderBy("addedAt", "asc");
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

function validatePlaylistName(name, BeforePlaylistName = null) {
  if (typeof name !== "string") {
    return "名前は文字列である必要があります";
  }

  const trimmedName = name.trim();
  const nameLength = countNameLength(trimmedName);

  if (!trimmedName) {
    return "名前を入力してください";
  }

  if (nameLength > MAX_NAME_LENGTH) {
    return "文字数オーバーです";
  }

  if (BeforePlaylistName !== null && trimmedName === BeforePlaylistName.trim()) {
    return "名前が同じです。違う名前にしてください";
  }

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

async function deleteFileIfUnused(field, filePath) {
  if (!filePath) return;

  const tracksUsingSameFile = await db.collectionGroup("tracks").where(field, "==", filePath).get();

  if (tracksUsingSameFile.size <= 1) {
    try {
      await bucket.file(filePath).delete();
      console.log(`Storageファイル削除済み: ${filePath}`);
    } catch (error) {
      console.warn(`Storageファイル削除失敗: ${filePath}`, error.message);
    }
  } else {
    console.log(`他のトラックも使用中のため削除スキップ: ${filePath}`);
  }
}

app.delete("/api/playlists/:playlistId/tracks/:trackId", async (req, res) => {
  try {
    const { playlistId, trackId } = req.params;
    const playlistRef = db.collection("playlists").doc(playlistId);
    const trackRef = playlistRef.collection("tracks").doc(trackId);
    const trackSnapshot = await trackRef.get();

    if (!trackSnapshot.exists) {
      return res.status(404).json({ error: "Track not found" });
    }

    const deletedTrack = trackSnapshot.data();

    await deleteFileIfUnused("audioPath", deletedTrack.audioPath);
    await deleteFileIfUnused("albumImagePath", deletedTrack.albumImagePath);

    await trackRef.delete();

    await playlistRef.update({
      totalDuration: admin.firestore.FieldValue.increment(-deletedTrack.duration_ms),
    });

    res.status(200).json({ deletedTrack });
  } catch (error) {
    console.error("曲の削除に失敗", error);
    res.status(500).json({ error: "曲の削除に失敗" });
  }
});

//===================
// プレイリストの削除
//===================

app.delete("/api/playlists/:playlistId", async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playlistRef = db.collection("playlists").doc(playlistId);
    const tracksRef = playlistRef.collection("tracks");

    const tracksSnapshot = await tracksRef.get();
    const batch = db.batch();
    tracksSnapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    await playlistRef.delete();
    // //////////////////////////////////////////////////////////////////////////
    const deletePromises = tracksSnapshot.docs.flatMap((doc) => {
      const data = doc.data();
      return [deleteFileIfUnused("audioPath", data.audioPath), deleteFileIfUnused("albumImagePath", data.albumImagePath)];
    });

    await Promise.all(deletePromises);

    res.sendStatus(200);
    console.log("✅プレイリスト削除成功");
  } catch (error) {
    console.error("プレイリストの削除に失敗", error);
    res.status(500).json({ error: "プレイリストの削除に失敗" });
  }
});

//=======================
// プレイリストの名前変更
//=======================

app.patch("/api/playlists/:playlistId", async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { newName, beforeName } = req.body;

    const error = validatePlaylistName(newName, beforeName);

    if (error) {
      console.log(`バリデーションエラー: ${error} newName: "${newName}", beforeName: "${beforeName}"）`);
      return res.status(400).json({ error });
    }

    const playlistRef = db.collection("playlists").doc(playlistId);
    await playlistRef.update({ name: newName });
    res.sendStatus(200);
  } catch (error) {
    console.error("プレイリストの削除に失敗", error);
    res.status(500).json({ error: "プレイリストの削除に失敗" });
  }
});
