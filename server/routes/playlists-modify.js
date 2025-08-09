const express = require("express");
const router = express.Router();
const { admin, db, bucket } = require("../firebase");
const { validatePlaylistName } = require("../utils/playlistValidation");

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

router.delete("/playlists/:playlistId/tracks/:trackId", async (req, res) => {
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

router.delete("/playlists/:playlistId", async (req, res) => {
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

router.patch("/playlists/:playlistId", async (req, res) => {
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
    console.error("プレイリストの名前変更失敗", error);
    res.status(500).json({ error: "プレイリストの名前変更失敗" });
  }
});

module.exports = router;
