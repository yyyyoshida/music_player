const admin = require("firebase-admin");
const serviceAccount = require("./my-music-player-8ae45-firebase-adminsdk-fbsvc-149eac64fa.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "my-music-player-8ae45.firebasestorage.app",
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
