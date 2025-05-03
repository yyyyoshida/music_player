// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAfwrJJbw54FeKYKyN4-GmmoZ7Fn1ciAaE',
  authDomain: 'my-music-player-8ae45.firebaseapp.com',
  projectId: 'my-music-player-8ae45',
  storageBucket: 'my-music-player-8ae45.firebasestorage.app',
  messagingSenderId: '651199236297',
  appId: '1:651199236297:web:5ba17f2cadcdf7d654a518',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// export const storage = getStorage(app);

export default db;
export { db };
