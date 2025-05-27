import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Use environment variables safely
const firebaseConfig = {
    apiKey: "AIzaSyB8_KnGrrCEsXDYOU8jnGpytqngneVIvog",
    authDomain: "link-home-547c6.firebaseapp.com",
    projectId: "link-home-547c6",
    storageBucket: "link-home-547c6.firebasestorage.app",
    messagingSenderId: "407411122261",
    appId: "1:407411122261:web:ae5570a44f9e16b898f4dc",
};

// Initialize Firebase safely on the client side
// Check if apps are already initialized to prevent multiple initializations
let app;
let auth;
let db;
let storage;

if (typeof window !== "undefined") {
    // We're on the client side
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
}

export { app, auth, db, storage };
