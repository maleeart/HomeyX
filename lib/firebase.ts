import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export const isFirebaseConfigured = Boolean(
  apiKey &&
  projectId &&
  !apiKey.includes("Dummy")
);

const firebaseConfig = {
  apiKey: apiKey || "AIzaSyDummyKeyForInitialSetupHomeyX",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "homeyx-demo.firebaseapp.com",
  projectId: projectId || "homeyx-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "homeyx-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:000000000000",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
