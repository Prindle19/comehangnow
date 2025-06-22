import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: Replace with your own configuration and move to a .env.local file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// To use this, create a .env.local file in the root of your project with these values:
// NEXT_PUBLIC_FIREBASE_API_KEY=...
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
// NEXT_PUBLIC_FIREBASE_APP_ID=...

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (firebaseConfig.apiKey) {
    try {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
    } catch (e) {
        console.error("Firebase initialization error:", e);
    }
}

export { app, auth };
