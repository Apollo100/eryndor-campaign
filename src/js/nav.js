// nav.js - DEBUG VERSION
console.log("=== NAV.JS DEBUG STARTING ===");

// Global state
let currentUserId = null;
let currentUserEmail = null;

function initializeNavigation() {
    console.log("🔍 DEBUG: Starting navigation initialization...");

    // Check if we can find the main elements
    const navToggle = document.getElementById("navToggle");
    const sideNav = document.querySelector(".side-nav");
    const navItemsWithSubmenu = document.querySelectorAll(".nav-item.has-submenu");
    
    console.log("🔍 DEBUG: navToggle found:", !!navToggle, navToggle);
    console.log("🔍 DEBUG: sideNav found:", !!sideNav, sideNav);
    console.log("🔍 DEBUG: navItemsWithSubmenu found:", navItemsWithSubmenu.length);

    // Log all nav items with submenus
    navItemsWithSubmenu.forEach((item, index) => {
        const link = item.querySelector(".nav-link");
        const submenu = item.querySelector(".submenu");
        const dropdownArrow = item.querySelector(".dropdown-arrow");
        
        console.log(`🔍 DEBUG: Nav Item ${index + 1}:`, {
            item: item,
            link: !!link,
            submenu: !!submenu,
            dropdownArrow: !!dropdownArrow,
            text: item.textContent?.trim()
        });
    });

    // 1. Side nav toggle functionality
    if (navToggle && sideNav) {
        const toggleIcon = navToggle.querySelector("i");
        console.log("🔍 DEBUG: toggleIcon found:", !!toggleIcon, toggleIcon);
        
        navToggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("🔄 DEBUG: Nav toggle clicked");
            
            sideNav.classList.toggle("open");
            console.log("🔄 DEBUG: sideNav open class:", sideNav.classList.contains("open"));

            if (toggleIcon) {
                if(sideNav.classList.contains("open")) {
                    toggleIcon.classList.remove("fa-bars");
                    toggleIcon.classList.add("fa-xmark");
                    console.log("🔄 DEBUG: Changed icon to X");
                } else {
                    toggleIcon.classList.remove("fa-xmark");
                    toggleIcon.classList.add("fa-bars");
                    console.log("🔄 DEBUG: Changed icon to bars");
                }
            }
        });
    }

    // 2. Submenu functionality
    navItemsWithSubmenu.forEach((item, index) => {
        const link = item.querySelector(".nav-link");
        const submenu = item.querySelector(".submenu");
        const dropdownArrow = item.querySelector(".dropdown-arrow");

        if (link && submenu) {
            console.log(`🔍 DEBUG: Setting up event listener for nav item ${index + 1}`);
            
            link.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`🔄 DEBUG: Submenu link ${index + 1} clicked`);

                const isOpen = item.classList.contains("open");
                console.log(`🔄 DEBUG: Was open: ${isOpen}`);

                // Close all other submenus
                document.querySelectorAll(".nav-item.has-submenu.open").forEach((openItem, openIndex) => {
                    if (openItem !== item) {
                        openItem.classList.remove("open");
                        console.log(`🔄 DEBUG: Closed other submenu ${openIndex + 1}`);
                        
                        const closedArrow = openItem.querySelector(".dropdown-arrow");
                        if (closedArrow) {
                            closedArrow.classList.remove("fa-chevron-up");
                            closedArrow.classList.add("fa-chevron-down");
                        }
                    }
                });

                // Toggle current item
                if (!isOpen) {
                    item.classList.add("open");
                    console.log(`🔄 DEBUG: Opened submenu ${index + 1}`);
                    
                    if (dropdownArrow) {
                        dropdownArrow.classList.remove("fa-chevron-down");
                        dropdownArrow.classList.add("fa-chevron-up");
                        console.log(`🔄 DEBUG: Rotated arrow up for submenu ${index + 1}`);
                    }
                } else {
                    item.classList.remove("open");
                    console.log(`🔄 DEBUG: Closed submenu ${index + 1}`);
                    
                    if (dropdownArrow) {
                        dropdownArrow.classList.remove("fa-chevron-up");
                        dropdownArrow.classList.add("fa-chevron-down");
                        console.log(`🔄 DEBUG: Rotated arrow down for submenu ${index + 1}`);
                    }
                }
            });

            // Prevent submenu from closing when clicking inside
            submenu.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log("🔄 DEBUG: Click inside submenu - preventing close");
            });
        } else {
            console.log(`❌ DEBUG: Missing link or submenu for nav item ${index + 1}`);
        }
    });

    // 3. Click outside to close submenus
    document.addEventListener('click', (e) => {
        const clickedInsideSubmenu = e.target.closest('.nav-item.has-submenu');
        if (!clickedInsideSubmenu) {
            const openSubmenus = document.querySelectorAll(".nav-item.has-submenu.open");
            if (openSubmenus.length > 0) {
                console.log("🔄 DEBUG: Click outside - closing all submenus");
                openSubmenus.forEach(openItem => {
                    openItem.classList.remove("open");
                    const dropdownArrow = openItem.querySelector(".dropdown-arrow");
                    if (dropdownArrow) {
                        dropdownArrow.classList.remove("fa-chevron-up");
                        dropdownArrow.classList.add("fa-chevron-down");
                    }
                });
            }
        }
    });

    // 4. Escape key to close submenus
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openSubmenus = document.querySelectorAll(".nav-item.has-submenu.open");
            if (openSubmenus.length > 0) {
                console.log("🔄 DEBUG: Escape key - closing all submenus");
                openSubmenus.forEach(openItem => {
                    openItem.classList.remove("open");
                    const dropdownArrow = openItem.querySelector(".dropdown-arrow");
                    if (dropdownArrow) {
                        dropdownArrow.classList.remove("fa-chevron-up");
                        dropdownArrow.classList.add("fa-chevron-down");
                    }
                });
            }
        }
    });

    console.log("✅ DEBUG: Navigation initialization complete");
}

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DEBUG: DOM Content Loaded");
    initializeNavigation();
});

// Rest of your existing code (auth, login, etc.) remains the same...
auth.onAuthStateChanged(user => {
    const loginItem = document.getElementById("loginItem");
    const userDropdown = document.getElementById("userDropdown");
    const userNameDisplay = document.getElementById("userNameDisplay");
    const dmOnly = document.querySelectorAll(".dm-only");
    const playerOnly = document.querySelectorAll(".player-only");

    if (user) {
        currentUserId = user.uid;
        currentUserEmail = user.email;

        if (loginItem) loginItem.style.display = "none";
        if (userDropdown) userDropdown.style.display = "block";

        if (userNameDisplay) {
            userNameDisplay.textContent = currentUserEmail.split("@")[0];
        }

        if (currentUserEmail === "dm@eryndor.local") {
            dmOnly.forEach(el => el.style.display = "block");
            playerOnly.forEach(el => el.style.display = "none");
        } else {
            dmOnly.forEach(el => el.style.display = "none");
            playerOnly.forEach(el => el.style.display = "block");
        }

    } else {
        currentUserId = null;
        currentUserEmail = null;

        if (loginItem) loginItem.style.display = "block";
        if (userDropdown) userDropdown.style.display = "none";
    }

    loadCharacters();
});

function toggleLogin(show) {
    document.getElementById("loginModal").style.display = show ? "flex" : "none";
    
    if (show) {
        document.getElementById('loginForm').style.display = 'flex';
        document.getElementById('createAccountForm').style.display = 'none';
        document.getElementById('loginToggle').classList.add('active');
        document.getElementById('createAccountToggle').classList.remove('active');
    }
}

async function login() {
    const username = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value;

    if (!username || !pass) {
        alert("Enter username and password.");
        return;
    }

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

function logout() {
    auth.signOut().then(() => {
        currentUserId = null;
        currentUserEmail = null;
        console.log("User logged out");
        loadCharacters();
    });
}

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

window.onclick = function(event) {
    const modal = document.getElementById("loginModal");
    if (event.target === modal) {
        toggleLogin(false);
    }
};

window.toggleLogin = toggleLogin;
window.login = login;
window.logout = logout;
window.loadCharacters = loadCharacters;

console.log("✅ DEBUG: NAV.JS COMPLETED");