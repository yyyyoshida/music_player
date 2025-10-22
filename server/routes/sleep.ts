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

export default router;
