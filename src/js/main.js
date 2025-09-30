import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFireStore } from 'firebase/firestore';

// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyA7Ss7d5s2YH2IgGek5WJd0nDL4Fl7r9ro",
    authDomain: "eryndor-d5d2d.firebaseapp.com",
    projectId: "eryndor-d5d2d",
    storageBucket: "eryndor-d5d2d.firebasestorage.app",
    messagingSenderId: "693835704456",
    appId: "1:693835704456:web:a11df8adfd343f8761d73d"
};

// --- Initialize Firebase ---
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUserId = null;
let currentUserEmail = null;

export { auth, db, currentUserId, currentUserEmail };

import './nav.js';
import './pc.js';
import './dm_user_manager.js';
import './dnd.js';
import './lorepage.js';

