import { auth, db } from './main.js';

document.addEventListener("DOMContentLoaded", () => {


    const dmEmail = "dm@eryndor.local";

    function showTab(id){
        document.querySelectorAll(".tab-section").forEach(sec => sec.classList.remove("active"));
        document.getElementById(id).classList.add("active");
    }

    document.querySelectorAll(".sidebar a").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const targetId = link.getAttribute("data-target");
            showTab(targetId);
        });
    });

    auth.onAuthStateChanged(user => {
        if (!user || user.email !== dmEmail) {
            alert("Turn Back Adventurer You Have Strayed From The Path.");
            window.location.href = "/index.html";
        }else{
            loadAccounts();
            loadCharacters();
            loadLore();
            //loadNotes();
        }
    });

    //========================================
    // Player Accounts
    //========================================

    async function createPlayer(){
        const username = document.getElementById("newUsername").value.trim();
        const password = document.getElementById("newPassword").value;

        if(!username || !password){
            alert("Enter Username and Password");
            return;
        }

        const email = `${username}@eryndor.local`;

        try{
            await auth.createUserWithEmailAndPassword(email, pass);
            alert(`Account Created: ${username}`);
            loadAccounts();
        }catch (err){
            alert(err.message);
        }
    };

    async function loadAccounts(){
        const list = document.getElementById("accountList");
        list.innerHTML = "<p>Loading...<p>";
    }

    //========================================
    // Characters
    //========================================

    async function loadCharacters() {
        const list = document.getElementById("characterList");
        list.innerHTML = "";

        const snap = await db.collection("characters").get();
        snap.forEach(doc => {
            const data = doc.data();
            const div = document.createElement("div");
            div.classList.add("card");
            div.innerHTML = `
            <h3>${data.name} (Lv ${data.level} ${data.race} ${data.class})</h3>
            <p>Owner: ${data.owner || "Unassigned"}</p>
            <button onclick="assignCharacter('${doc.id}')">Assign</button>
            `;
            list.appendChild(div);
        });
    }

    function assignCharacter(charId) {
        alert(`TODO: Assign Character ${charId} To A Player`);
    }

    //========================================
    // Secrets and Lore
    //========================================
    async function saveLore() {
        const text = document.getElementById("loreInput").value;
        if(!text) return;

        await db.collection("lore").add({
            body: text,
            createdAt: new Data().toISOString()
        });

        document.getElementById("loreInput").value = "";
        loadLore();
    }

    async function loadLore() {
        const list = document.getElementById("loreList");
        list.innerHTML = "";

        const snap = await db.collection("lore").get();
        snap.forEach(doc => {
            const data = doc.data();
            const div = document.createElement("div");
            div.classList.add("card");
            div.innerHTML = `<p>${data.body}</p><small>${data.createdAt}</small>`;
            list.appendChild(div);
        });
    }
});