// nav.js - DEBUG VERSION
console.log("=== NAV.JS STARTING ===");

// Test if globals are available
console.log("window.auth:", typeof window.auth);
console.log("window.db:", typeof window.db);

if (typeof window.auth === 'undefined') {
    console.error("CRITICAL: window.auth is undefined!");
} else {
    console.log("SUCCESS: window.auth is defined");
}

// Simple test function
function testAuth() {
    console.log("Testing auth in nav.js...");
    try {
        console.log("Auth object:", window.auth);
        return true;
    } catch (error) {
        console.error("Auth test failed:", error);
        return false;
    }
}

testAuth();

console.log("=== NAV.JS COMPLETED ===");