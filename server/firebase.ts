import admin, { ServiceAccount } from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
    storageBucket: "my-music-player-8ae45.firebasestorage.app",
  });
}

export const db = admin.firestore();
export const bucket = admin.storage().bucket();
export { admin };
