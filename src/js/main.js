// main.js - DEBUG VERSION
console.log("=== STARTING MAIN.JS ===");

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

console.log("Firebase imports loaded");

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA7Ss7d5s2YH2IgGek5WJd0nDL4Fl7r9ro",
    authDomain: "eryndor-d5d2d.firebaseapp.com",
    projectId: "eryndor-d5d2d",
    storageBucket: "eryndor-d5d2d.firebasestorage.app",
    messagingSenderId: "693835704456",
    appId: "1:693835704456:web:a11df8adfd343f8761d73d"
};

console.log("Firebase config defined");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase initialized - auth:", typeof auth, "db:", typeof db);

// Set as global variables
window.auth = auth;
window.db = db;
window.currentUserId = null;
window.currentUserEmail = null;

console.log("Global variables set");

// Test if auth is working
console.log("Auth object test:", auth?.app?.name);

// Now import other modules
console.log("About to import nav.js");
import('./nav.js').then(() => {
    console.log("nav.js loaded successfully");
}).catch(error => {
    console.error("FAILED to load nav.js:", error);
});

console.log("=== MAIN.JS COMPLETED ===");

