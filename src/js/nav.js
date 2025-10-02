document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('navbar-container');

  // Load navbar HTML
  fetch('/navbar.html')
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;

      // Initialize navbar functionality
      initMobileToggle(container);
      initSubmenus(container);
      highlightActiveLink(container);
      initUserDropdown(container);

      // Bind login modal toggle
      bindLoginModal();
      bindLoginForm();
      bindCreateAccountForm();
    })
    .catch(err => console.error('Error loading navbar:', err));

  // Start auth listener
  initAuthListener();

  // Load character cards (live updates)
  loadCharacters();
});

// ===============================
// Navbar functions
// ===============================
function initMobileToggle(container) {
  const navToggle = container.querySelector('#navToggle');
  const sideNav = container.querySelector('.side-nav');
  const toggleIcon = navToggle.querySelector('i');

  navToggle.addEventListener('click', () => {
    sideNav.classList.toggle('open');
    toggleIcon.classList.toggle('fa-bars');
    toggleIcon.classList.toggle('fa-xmark');
  });
}

function initSubmenus(container) {
  const submenuLinks = container.querySelectorAll('.nav-item.has-submenu > .nav-link');

  submenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const item = link.parentElement;
      const isOpen = item.classList.contains('open');

      // Close all open submenus
      container.querySelectorAll('.nav-item.has-submenu.open')
        .forEach(openItem => openItem.classList.remove('open'));

      if (!isOpen) item.classList.add('open');
    });
  });
}

function highlightActiveLink(container) {
  const links = container.querySelectorAll('.nav-list a');
  const currentPage = window.location.pathname.split('/').pop();
  links.forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });
}

function initUserDropdown(container) {
  const loginItem = container.querySelector('#loginItem');
  const userDropdown = container.querySelector('#userDropdown');
  const userNameDisplay = container.querySelector('#userNameDisplay');
  const dmOnly = container.querySelectorAll('.dm-only');
  const playerOnly = container.querySelectorAll('.player-only');

  // Expose a helper to update user state
  window.updateNavbarForUser = (user) => {
    if (user) {
      const email = user.email;
      if (loginItem) loginItem.style.display = 'none';
      if (userDropdown) userDropdown.style.display = 'block';
      if (userNameDisplay) userNameDisplay.textContent = email.split('@')[0];

      if (email === 'dm@eryndor.local') {
        dmOnly.forEach(el => el.style.display = 'block');
        playerOnly.forEach(el => el.style.display = 'none');
      } else {
        dmOnly.forEach(el => el.style.display = 'none');
        playerOnly.forEach(el => el.style.display = 'block');
      }
    } else {
      if (loginItem) loginItem.style.display = 'block';
      if (userDropdown) userDropdown.style.display = 'none';
    }
  };
}

// ===============================
// Login modal & forms
// ===============================
function bindLoginModal() {
  const modal = document.getElementById('loginModal');
  window.toggleLogin = function(show) {
    if (!modal) return;
    modal.style.display = show ? 'flex' : 'none';

    if (show) {
      document.getElementById('loginForm').style.display = 'flex';
      document.getElementById('createAccountForm').style.display = 'none';
      document.getElementById('loginToggle').classList.add('active');
      document.getElementById('createAccountToggle').classList.remove('active');
    }
  };

  window.onclick = function(event) {
    if (event.target === modal) toggleLogin(false);
  };
}

function bindLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) return alert('Enter username and password.');

    const email = username.toLowerCase() === 'dm' ? 'dm@eryndor.local' : `${username}@eryndor.local`;

    try {
      const userCred = await auth.signInWithEmailAndPassword(email, password);
      toggleLogin(false);
    } catch (err) {
      alert(err.message);
    }
  });
}

function bindCreateAccountForm() {
  const form = document.getElementById('createAccountForm');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (!username || !password) return alert("Provide both username and password.");
    if (password !== confirm) return alert("Passwords do not match.");
    if (password.length < 6) return alert("Password must be at least 6 characters.");

    try {
      const email = `${username}@eryndor.local`;
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);

      await db.collection("characters").doc(userCredential.user.uid).set({
        name: username,
        owner: userCredential.user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        level: 1,
        race: "Unknown",
        class: "Adventurer",
        ac: 10,
        hp: { current: 10, max: 10, temp: 0 },
        stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        currency: { chords: 10, echoes: 10, notes: 10 },
        speed: 30,
        alignment: "neutral"
      });

      alert(`Welcome to Eryndor, ${username}! Character created.`);
      toggleLogin(false);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') alert("Username already taken.");
      else alert("Error: " + err.message);
    }
  });
}

// ===============================
// Firebase auth listener
// ===============================
function initAuthListener() {
  auth.onAuthStateChanged(user => {
    if (window.updateNavbarForUser) window.updateNavbarForUser(user);
    currentUserId = user ? user.uid : null;
    currentUserEmail = user ? user.email : null;
    loadCharacters(); // refresh character cards
  });
}

// ===============================
// Logout
// ===============================
function logout() {
  auth.signOut();
}

// ===============================
// Character loading/rendering
// ===============================
function loadCharacters() {
  const container = document.getElementById('pc-container');
  if (!container) return;

  db.collection("characters").onSnapshot(snapshot => {
    container.innerHTML = "";
    snapshot.forEach(doc => renderPcCard(doc.id, doc.data()));
  });
}

function renderPcCard(id, data) {
  const container = document.getElementById('pc-container');
  if (!container) return;

  const card = document.createElement('div');
  card.classList.add('npc-card');
  card.innerHTML = `
    <h2>${data.name} (Lv ${data.level} ${data.race} ${data.class})</h2>
    <p><strong>AC:</strong> ${data.ac} | <strong>HP:</strong> ${data.hp.current}/${data.hp.max}</p>
    <p><strong>Stats:</strong> STR ${data.stats.strength}, DEX ${data.stats.dexterity}, CON ${data.stats.constitution}, INT ${data.stats.intelligence}, WIS ${data.stats.wisdom}, CHA ${data.stats.charisma}</p>
  `;

  if (currentUserId === data.owner || currentUserEmail === 'dm@eryndor.local') {
    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.onclick = () => openEditModal(id, data);
    card.appendChild(editBtn);
  }

  container.appendChild(card);
}