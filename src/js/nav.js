// nav.js - REMOVE ALL IMPORTS at the top

// ===============================
// Navbar toggle (mobile support)
// ===============================
const primaryNav = document.getElementById("primary-navigation");
const navToggle = document.querySelector(".mobile-nav-toggle");

document.addEventListener("DOMContentLoaded", () => {
  console.log("nav.js loaded - auth available:", typeof window.auth !== 'undefined');
  
  const navItemsWithSubmenu = document.querySelectorAll(".nav-item.has-submenu");

  const navToggle = document.getElementById("navToggle");
  const sideNav = document.querySelector(".side-nav");
  const toggleIcon = navToggle.querySelector("i");

  navToggle.addEventListener("click", () => {
    sideNav.classList.toggle("open");

    if(sideNav.classList.contains("open")) {
      toggleIcon.classList.remove("fa-bars");
      toggleIcon.classList.add("fa-xmark");
    } else {
      toggleIcon.classList.remove("fa-xmark");
      toggleIcon.classList.add("fa-bars");
    }
  })

  navItemsWithSubmenu.forEach(item => {
    const link = item.querySelector(".nav-link");

    link.addEventListener("click", (e) => {
      const submenu = item.querySelector(".submenu");
      if (!submenu) return;

      e.preventDefault();

      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".nav-item.has-submenu.open")
        .forEach(openItem => openItem.classList.remove("open"));

      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });

  // ===============================
  // Login/Create Account Form Toggle
  // ===============================
  const loginToggle = document.getElementById('loginToggle');
  const createAccountToggle = document.getElementById('createAccountToggle');
  const loginForm = document.getElementById('loginForm');
  const createAccountForm = document.getElementById('createAccountForm');

  if (loginToggle && createAccountToggle) {
    loginToggle.addEventListener('click', function() {
      loginForm.style.display = 'block';
      createAccountForm.style.display = 'none';
      loginToggle.classList.add('active');
      createAccountToggle.classList.remove('active');
    });

    createAccountToggle.addEventListener('click', function() {
      loginForm.style.display = 'none';
      createAccountForm.style.display = 'block';
      loginToggle.classList.remove('active');
      createAccountToggle.classList.add('active');
    });
  }

  // ===============================
  // Create Account Form Submission
  // ===============================
  const createAccountFormEl = document.getElementById('createAccountForm');
  if (createAccountFormEl) {
    createAccountFormEl.addEventListener('submit', async function(e) {
      e.preventDefault();
      const username = document.getElementById('newUsername').value.trim();
      const password = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (!username || !password) {
        alert("Please Provide Both A Character Name and Passphrase.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passphrases Do Not Match!");
        return;
      }

      if (password.length < 6){
        alert("Passphrase Must Be At Least 6 Characters Long.");
        return;
      }

      try {
        const email = `${username}@eryndor.local`;
        // Use window.auth instead of auth
        const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);

        // Use window.db instead of db
        await window.db.collection("characters").doc(userCredential.user.uid).set({
          name: username,
          owner: userCredential.user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          level: 1,
          race: "Unknown",
          class: "Adventurer",
          ac: 10,
          hp: { current: 10, max: 10, temp: 0 },
          stats: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
          },
          currency: {
            chords: 10,
            echoes: 10,
            notes: 10
          },
          speed: 30,
          alignment: "neutral"
        });

        alert(`Welcome to Eryndor, ${username}! Your Character Has Been Created.`);
        toggleLogin(false);
      } catch (error) {
        console.error("Error Creating Account:", error);

        if (error.code === 'auth/email-already-in-use') {
          alert("This Character Name Is Already Taken. Please Choose Another.");
        } else {
          alert("Error Creating Account: " + error.message);
        }
      }
    });
  }
});

// ===============================
// Auth state tracking
// ===============================
// Use window.auth instead of auth
window.auth.onAuthStateChanged(user => {
  const loginItem = document.getElementById("loginItem");
  const userDropdown = document.getElementById("userDropdown");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const dmOnly = document.querySelectorAll(".dm-only");
  const playerOnly = document.querySelectorAll(".player-only");

  if (user) {
    window.currentUserId = user.uid;
    window.currentUserEmail = user.email;

    if (loginItem) loginItem.style.display = "none";
    if (userDropdown) userDropdown.style.display = "block";

    if (userNameDisplay) {
      userNameDisplay.textContent = window.currentUserEmail.split("@")[0];
    }

    if (window.currentUserEmail === "dm@eryndor.local") {
      dmOnly.forEach(el => el.style.display = "block");
      playerOnly.forEach(el => el.style.display = "none");
    } else {
      dmOnly.forEach(el => el.style.display = "none");
      playerOnly.forEach(el => el.style.display = "block");
    }

  } else {
    window.currentUserId = null;
    window.currentUserEmail = null;

    if (loginItem) loginItem.style.display = "block";
    if (userDropdown) userDropdown.style.display = "none";
  }

  loadCharacters();
});

// ===============================
// Login modal toggle
// ===============================
function toggleLogin(show) {
  document.getElementById("loginModal").style.display = show ? "flex" : "none";
  
  if (show) {
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('createAccountForm').style.display = 'none';
    document.getElementById('loginToggle').classList.add('active');
    document.getElementById('createAccountToggle').classList.remove('active');
  }
}

window.onclick = function(event) {
  const modal = document.getElementById("loginModal");
  if (event.target === modal) {
    toggleLogin(false);
  }
};

// ===============================
// Login logic
// ===============================
async function login() {
  const username = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value;

  if (!username || !pass) {
    alert("Enter username and password.");
    return;
  }

  if (username.toLowerCase() === "dm") {
    try {
      const userCred = await window.auth.signInWithEmailAndPassword("dm@eryndor.local", pass);
      window.currentUserId = userCred.user.uid;
      window.currentUserEmail = userCred.user.email;
      alert("Welcome, Dungeon Master!");
      toggleLogin(false);
      return;
    } catch (err) {
      alert(err.message);
      return;
    }
  }

  try {
    const email = `${username}@eryndor.local`;
    const userCred = await window.auth.signInWithEmailAndPassword(email, pass);
    window.currentUserId = userCred.user.uid;
    window.currentUserEmail = userCred.user.email;

    alert(`Welcome, ${username}!`);
    toggleLogin(false);
  } catch (err) {
    alert(err.message);
  }
}

// ===============================
// Logout
// ===============================
function logout() {
  window.auth.signOut().then(() => {
    window.currentUserId = null;
    window.currentUserEmail = null;
    console.log("User logged out");
    loadCharacters();
  });
}

// ===============================
// Load characters (live updates)
// ===============================
function loadCharacters() {
  const pcContainer = document.getElementById("pc-container");
  if (!pcContainer) return;

  // Use window.db instead of db
  window.db.collection("characters").onSnapshot(snapshot => {
    pcContainer.innerHTML = "";
    snapshot.forEach(doc => renderPcCard(doc.id, doc.data()));
  });
}

function renderPcCard(id, data) {
  const card = document.createElement("div");
  card.classList.add("npc-card");

  card.innerHTML = `
    <h2>${data.name} (Lv ${data.level} ${data.race} ${data.class})</h2>
    <p><strong>AC:</strong> ${data.ac} | 
       <strong>HP:</strong> ${data.hp.current}/${data.hp.max}</p>
    <p><strong>Stats:</strong>
      STR ${data.stats.strength}, 
      DEX ${data.stats.dexterity}, 
      CON ${data.stats.constitution}, 
      INT ${data.stats.intelligence}, 
      WIS ${data.stats.wisdom}, 
      CHA ${data.stats.charisma}
    </p>
  `;

  if (window.currentUserId === data.owner || window.currentUserEmail === "dm@eryndor.local") {
    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.onclick = () => openEditModal(id, data);
    card.appendChild(editBtn);
  }

  document.getElementById("pc-container").appendChild(card);
}

// Make functions globally available
window.toggleLogin = toggleLogin;
window.login = login;
window.logout = logout;
window.loadCharacters = loadCharacters;