import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "./my-music-player-8ae45-firebase-adminsdk-fbsvc-149eac64fa.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
    storageBucket: "my-music-player-8ae45.firebasestorage.app",
  });
}

export const db = admin.firestore();
export const bucket = admin.storage().bucket();
export { admin };
