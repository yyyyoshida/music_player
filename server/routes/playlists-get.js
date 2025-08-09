const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

// プレイリスト一覧取得
router.get("/playlists", async (req, res) => {
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
    console.log("プレイリスト一覧取得");
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).json({ error: "データ取得失敗" });
  }
});

// プレイリストのメタ情報取得
router.get("/playlists/:id/info", async (req, res) => {
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
    console.log("プレイリストメタ情報取得");
  } catch (error) {
    console.error("エラー", error);
    res.status(500).json({ error: "プレイリストのメタ情報取得失敗" });
  }
});

// プレイリストのトラック取得
router.get("/playlists/:id/tracks", async (req, res) => {
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
    console.log("プレイリストのトラック取得");
  } catch (error) {
    console.error("エラー", error);
    res.status(500).json({ error: "トラック取得失敗" });
  }
});

module.exports = router;
