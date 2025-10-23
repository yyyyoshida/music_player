import express from "express";
const router = express.Router();
import { admin, db } from "../firebase";

router.post("/sleep/spotify-tracks", async (req, res) => {
  try {
    const track = req.body;

    const newTrackRef = await db.collection("sleepTracks").add({
      ...track,
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const newTrackSnapshot = await newTrackRef.get();
    const sleepingTrack = { id: newTrackRef.id, ...newTrackSnapshot.data() };

    res.status(200).json({ sleepingTrack });
  } catch (error) {
    console.error("曲のスリープに失敗", error);
    res.status(500).json({ error: "曲のスリープに失敗" });
  }
});

router.get("/sleep/spotify-tracks", async (_req, res) => {
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

export default router;
