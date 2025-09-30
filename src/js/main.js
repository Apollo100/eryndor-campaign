// main.js - Proper Vite entry point
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

// Global state
let currentUserId = null;
let currentUserEmail = null;

// Wait for DOM to be ready before importing other modules
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing app...');
    
    try {
        // Import other modules after DOM is ready and Firebase is initialized
        const { default: initNav } = await import('./nav.js');
        const { default: initPC } = await import('./pc.js');
        const { default: initDM } = await import('./dm_user_manager.js');
        const { default: initDND } = await import('./dnd.js');
        const { default: initLore } = await import('./lorepage.js');
        
        console.log("All modules imported, initializing...");
        
        // Initialize modules with dependencies
        initNav(auth, db, currentUserId, currentUserEmail);
        initPC(auth, db, currentUserId, currentUserEmail);
        initDM(auth, db);
        initDND();
        initLore();
        
        console.log('App fully initialized');
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
});

// Export for potential use elsewhere
export { auth, db, currentUserId, currentUserEmail };

console.log("=== MAIN.JS SETUP COMPLETED ===");