import fs from "fs";
import admin, { ServiceAccount } from "firebase-admin";

const serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_KEY_PATH!, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
    storageBucket: "my-music-player-8ae45.firebasestorage.app",
  });
}

export const db = admin.firestore();
export const bucket = admin.storage().bucket();
export { admin };
