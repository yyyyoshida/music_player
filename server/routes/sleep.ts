import express from "express";
const router = express.Router();
import { admin, db } from "../firebase";

router.post("/sleep/tracks", async (req, res) => {
  try {
    const track = req.body;
    const foundPlaylistIds: string[] = [];
    const matchedTracks: { trackId: string; playlistId: string }[] = [];

    const playlistSnapshots = await db.collection("playlists").get();

    for (const playlistDoc of playlistSnapshots.docs) {
      const playlistId = playlistDoc.id;

      const trackQuery = await db
        .collection("playlists")
        .doc(playlistId)
        .collection("tracks")
        .where("trackId", "==", track.trackId)
        .get();

      if (!trackQuery.empty) {
        foundPlaylistIds.push(playlistId);

        trackQuery.forEach((track) => {
          matchedTracks.push({ trackId: track.id, playlistId });
        });
      }
    }

    const newTrackRef = await db.collection("sleepTracks").add({
      ...track,
      playlistIds: foundPlaylistIds,
      addedAt: new Date().toISOString(),
    });

    const newTrackSnapshot = await newTrackRef.get();
    const sleepingTrack = { id: newTrackRef.id, ...newTrackSnapshot.data() };

    res.status(200).json({ sleepingTrack, matchedTracks });
  } catch (error) {
    console.error("曲のスリープに失敗", error);
    res.status(500).json({ error: "曲のスリープに失敗" });
  }
});

router.delete("/sleep/playlists/:playlistId/tracks/:trackId", async (req, res) => {
  try {
    const { playlistId, trackId } = req.params;
    const playlistRef = db.collection("playlists").doc(playlistId);
    const trackRef = playlistRef.collection("tracks").doc(trackId);
    const trackSnapshot = await trackRef.get();

    if (!trackSnapshot.exists) {
      return res.status(404).json({ error: "曲が存在しない" });
    }

    const deletedTrack = trackSnapshot.data();
    if (!deletedTrack) return res.status(404).json({ error: "曲が存在しない" });

    await trackRef.delete();

    await playlistRef.update({
      totalDuration: admin.firestore.FieldValue.increment(-deletedTrack.duration_ms),
    });

    res.status(200).json(deletedTrack);
  } catch (error) {
    console.error("曲の削除に失敗", error);
    res.status(500).json({ error: "曲の削除に失敗" });
  }
});

router.get("/sleep/tracks", async (_req, res) => {
  try {
    const sleepTracksRef = db.collection("sleepTracks").orderBy("addedAt", "asc");
    const sleepTracksSnapshot = await sleepTracksRef.get();
    const sleepTracks = sleepTracksSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...doc.data(),
        addedAt: data.addedAt ? data.addedAt.toDate().toISOString() : null,
      };
    });

    res.status(200).json(sleepTracks);
  } catch (error) {
    console.error("エラー", error);
    res.status(500).json({ error: "トラック取得失敗" });
  }
});

router.delete("/sleep/spotify-tracks/:trackId", async (req, res) => {
  try {
    const { trackId } = req.params;
    const trackRef = db.collection("sleepTracks").doc(trackId);
    const trackSnapshot = await trackRef.get();

    if (!trackSnapshot.exists) {
      return res.status(404).json({ error: "曲が存在しない" });
    }

    const deletedTrack = trackSnapshot.data();
    await trackRef.delete();

    res.status(200).json(deletedTrack);
  } catch (error) {
    console.error("スリープ一覧からの削除に失敗:", error);
    res.status(500).json({ error: "スリープ一覧からの削除に失敗" });
  }
});

router.post("/sleep/spotify-tracks/restore", async (req, res) => {
  try {
    const track = req.body;
    const playlistIds = track.playlistIds;

    if (!playlistIds || playlistIds.length === 0) {
      return res.status(400).json({ error: "playlistIds が指定されていません" });
    }

    const { playlistIds: _, ...trackRest } = track;

    const batch = db.batch();
    const restoredTracks: { track: any }[] = [];

    for (const playlistId of playlistIds) {
      const playlistRef = db.collection("playlists").doc(playlistId);
      const tracks = playlistRef.collection("tracks");

      const newTrackRef = tracks.doc();

      const resTrackData = {
        ...trackRest,
        id: newTrackRef.id,
        addedAt: new Date().toISOString(),
      };

      batch.set(newTrackRef, resTrackData);

      batch.update(playlistRef, {
        totalDuration: admin.firestore.FieldValue.increment(Number(track.duration_ms)),
      });

      restoredTracks.push(resTrackData);
    }

    await batch.commit();

    const updatedPlaylists = await Promise.all(
      playlistIds.map(async (playlistId: string) => {
        const playlistRef = await db.collection("playlists").doc(playlistId).get();
        return { playlistId, totalDuration: playlistRef.data()?.totalDuration || 0 };
      })
    );

    res.status(200).json({ restoredTracks, updatedPlaylists });
  } catch (error) {
    console.error("プレイリストに追加失敗", error);
    res.status(500).json({ error: "プレイリストに追加失敗" });
  }
});

export default router;
