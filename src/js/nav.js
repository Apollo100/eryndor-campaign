// nav.js - Fixed dropdown functionality
export default function initNav(auth, db, currentUserId, currentUserEmail) {
    console.log("Initializing nav module...");

    // ===============================
    // Navbar toggle (mobile support) - FIXED
    // ===============================
    function initializeNavigation() {
        console.log("Initializing navigation...");

        // Fix: Use the correct navToggle element
        const navToggle = document.getElementById("navToggle");
        const sideNav = document.querySelector(".side-nav");
        
        console.log("navToggle found:", !!navToggle);
        console.log("sideNav found:", !!sideNav);

        if (navToggle && sideNav) {
            const toggleIcon = navToggle.querySelector("i");
            console.log("toggleIcon found:", !!toggleIcon);

            if (toggleIcon) {
                navToggle.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Nav toggle clicked");
                    
                    sideNav.classList.toggle("open");

                    if(sideNav.classList.contains("open")) {
                        toggleIcon.classList.remove("fa-bars");
                        toggleIcon.classList.add("fa-xmark");
                    } else {
                        toggleIcon.classList.remove("fa-xmark");
                        toggleIcon.classList.add("fa-bars");
                    }
                });
            }
        }

        // Fix: Submenu functionality with better event handling
        const navItemsWithSubmenu = document.querySelectorAll(".nav-item.has-submenu");
        console.log(`Found ${navItemsWithSubmenu.length} submenu items`);

        navItemsWithSubmenu.forEach(item => {
            const link = item.querySelector(".nav-link");
            const submenu = item.querySelector(".submenu");

            if (link && submenu) {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Submenu link clicked");

                    const isOpen = item.classList.contains("open");

                    // Close all other submenus first
                    document.querySelectorAll(".nav-item.has-submenu.open").forEach(openItem => {
                        if (openItem !== item) {
                            openItem.classList.remove("open");
                        }
                    });

                    // Toggle current item
                    if (!isOpen) {
                        item.classList.add("open");
                    } else {
                        item.classList.remove("open");
                    }
                });

                // Prevent submenu from closing when clicking inside
                submenu.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        });

        // Close submenus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item.has-submenu')) {
                document.querySelectorAll(".nav-item.has-submenu.open").forEach(openItem => {
                    openItem.classList.remove("open");
                });
            }
        });

        // Close submenus on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll(".nav-item.has-submenu.open").forEach(openItem => {
                    openItem.classList.remove("open");
                });
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        console.log("DOM loaded, initializing navigation...");
        
        // Initialize navigation first
        initializeNavigation();

        // ===============================
        // Login/Create Account Form Toggle
        // ===============================
        const loginToggle = document.getElementById('loginToggle');
        const createAccountToggle = document.getElementById('createAccountToggle');
        const loginForm = document.getElementById('loginForm');
        const createAccountForm = document.getElementById('createAccountForm');

        if (loginToggle && createAccountToggle && loginForm && createAccountForm) {
            console.log("Login form elements found");
            
            loginToggle.addEventListener('click', function(e) {
                e.preventDefault();
                loginForm.style.display = 'block';
                createAccountForm.style.display = 'none';
                loginToggle.classList.add('active');
                createAccountToggle.classList.remove('active');
            });

            createAccountToggle.addEventListener('click', function(e) {
                e.preventDefault();
                loginForm.style.display = 'none';
                createAccountForm.style.display = 'block';
                loginToggle.classList.remove('active');
                createAccountToggle.classList.add('active');
            });
        }

        // ===============================
        // Create Account Form Submission - FIXED Firebase syntax
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
                    const userCredential = await auth.createUserWithEmailAndPassword(email, password);

                    // FIXED: Use modular Firebase syntax
                    const { serverTimestamp } = await import('firebase/firestore');

                    await db.collection("characters").doc(userCredential.user.uid).set({
                        name: username,
                        owner: userCredential.user.uid,
                        createdAt: serverTimestamp(),
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
    auth.onAuthStateChanged(user => {
        const loginItem = document.getElementById("loginItem");
        const userDropdown = document.getElementById("userDropdown");
        const userNameDisplay = document.getElementById("userNameDisplay");
        const dmOnly = document.querySelectorAll(".dm-only");
        const playerOnly = document.querySelectorAll(".player-only");

        if (user) {
            currentUserId = user.uid;
            currentUserEmail = user.email;

            // Toggle login vs dropdown
            if (loginItem) loginItem.style.display = "none";
            if (userDropdown) userDropdown.style.display = "block";

            // Show username
            if (userNameDisplay) {
                userNameDisplay.textContent = currentUserEmail.split("@")[0];
            }

            // Role-based links
            if (currentUserEmail === "dm@eryndor.local") {
                dmOnly.forEach(el => el.style.display = "block");
                playerOnly.forEach(el => el.style.display = "none");
            } else {
                dmOnly.forEach(el => el.style.display = "none");
                playerOnly.forEach(el => el.style.display = "block");
            }

        } else {
            // Reset state if logged out
            currentUserId = null;
            currentUserEmail = null;

            if (loginItem) loginItem.style.display = "block";
            if (userDropdown) userDropdown.style.display = "none";
        }

        loadCharacters(); // refresh PC cards whenever auth state changes
    });

    // ===============================
    // Login modal toggle
    // ===============================
    function toggleLogin(show) {
        const loginModal = document.getElementById("loginModal");
        if (loginModal) {
            loginModal.style.display = show ? "flex" : "none";
            
            // Reset to login form when opening
            if (show) {
                const loginForm = document.getElementById('loginForm');
                const createAccountForm = document.getElementById('createAccountForm');
                const loginToggle = document.getElementById('loginToggle');
                const createAccountToggle = document.getElementById('createAccountToggle');
                
                if (loginForm) loginForm.style.display = 'flex';
                if (createAccountForm) createAccountForm.style.display = 'none';
                if (loginToggle) loginToggle.classList.add('active');
                if (createAccountToggle) createAccountToggle.classList.remove('active');
            }
        }
    }

    // ===============================
    // Login logic
    // ===============================
    async function login() {
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        
        if (!usernameInput || !passwordInput) return;
        
        const username = usernameInput.value.trim();
        const pass = passwordInput.value;

        if (!username || !pass) {
            alert("Enter username and password.");
            return;
        }

        // DM login
        if (username.toLowerCase() === "dm") {
            try {
                const userCred = await auth.signInWithEmailAndPassword("dm@eryndor.local", pass);
                currentUserId = userCred.user.uid;
                currentUserEmail = userCred.user.email;
                alert("Welcome, Dungeon Master!");
                toggleLogin(false);
                return;
            } catch (err) {
                alert(err.message);
                return;
            }
        }

        // Normal player login
        try {
            const email = `${username}@eryndor.local`;
            const userCred = await auth.signInWithEmailAndPassword(email, pass);
            currentUserId = userCred.user.uid;
            currentUserEmail = userCred.user.email;

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
        auth.signOut().then(() => {
            currentUserId = null;
            currentUserEmail = null;
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

        db.collection("characters").onSnapshot(snapshot => {
            pcContainer.innerHTML = "";
            snapshot.forEach(doc => renderPcCard(doc.id, doc.data()));
        });
    }

    function renderPcCard(id, data) {
        const pcContainer = document.getElementById("pc-container");
        if (!pcContainer) return;

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

        if (currentUserId === data.owner || currentUserEmail === "dm@eryndor.local") {
            const editBtn = document.createElement("button");
            editBtn.innerText = "Edit";
            editBtn.onclick = () => openEditModal(id, data);
            card.appendChild(editBtn);
        }

        pcContainer.appendChild(card);
    }

    // Global click handler for modal
    window.onclick = function(event) {
        const modal = document.getElementById("loginModal");
        if (event.target === modal) {
            toggleLogin(false);
        }
    };

    // Make functions globally available
    window.toggleLogin = toggleLogin;
    window.login = login;
    window.logout = logout;
    window.loadCharacters = loadCharacters;

    console.log("Nav module initialized successfully");
}