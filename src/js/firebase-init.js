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
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();