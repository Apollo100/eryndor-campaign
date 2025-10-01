const pcContainer = document.getElementById("pc-container");

// Watch auth state
auth.onAuthStateChanged(user => {
  if (user) {
    currentUserId = user.uid;
    currentUserEmail = user.email;
  } else {
    currentUserId = null;
    currentUserEmail = null;
  }
});

async function loadCharacters() {
  pcContainer.innerHTML = "";

  const snapshot = await db.collection("characters").get();
  snapshot.forEach(doc => renderPcCard(doc.id, doc.data()));
}

function renderPcCard(id, data) {
  const card = document.createElement("div");

  card.classList.add("pc-card"); // reuse your CSS

  const classIcons = {
    barbarian: "fa-cake-candles",
    bard: "fa-music",
    cleric: "fa-cross",
    druid: "fa-leaf",
    fighter: "fa-shield-alt",
    monk: "fa-yin-yang",
    paladin: "fa-sun",
    ranger: "fa-bow-arrow",
    rogue: "fa-user-ninja",
    sorcerer: "fa-fire",
    warlock: "fa-skull",
    wizard: "fa-hat-wizard"
  };

  const iconClass = classIcons[data.class.toLowerCase()] || "fa-question";

  card.innerHTML = `
    <div class="pc-card-header">
      <h2 class = "pc-name">${data.name}</h2>
      <div class="pc-race-class">${data.race} ${data.class} (Level  ${data.level})</div>
    </div>

    <div class="pc-card-body">
      <div class = "pc-tags">
        <span class = "pc-tag">AC: ${data.ac}</span>
        <span class = "pc-tag">HP: ${data.hp.current} / ${data.hp.max}</span>
      </div>

      <div class="pc-description">
        <p>${data.description || "No Description Provided."}</p>
      </div>

      <div class="pc-details">
        <div class="pc-detail-section">
          <h4><i class="fas fa-chart-bar"></i> Stats</h4>
          <div class="pc_stats">
            <div class="pc-stat"><span>STR:</span>${data.stats.strength}</div>
            <div class="pc-stat"><span>DEX:</span>${data.stats.dexterity}</div>
            <div class="pc-stat"><span>CON:</span>${data.stats.constitution}</div>
            <div class="pc-stat"><span>INT:</span>${data.stats.intelligence}</div>
            <div class="pc-stat"><span>WIS:</span>${data.stats.wisdom}</div>
            <div class="pc-stat"><span>CHA:</span>${data.stats.charisma}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  card.classList.add("pc-card", `class-{dara.class.toLowerCase()}`)

  card.addEventListener("click", (e) => {
    if(!e.target.closest(".editBtn")){
      card.classList.toggle("expanded");
    }
  })

  // Add Edit button if owner or DM
  if (currentUserId === data.owner || currentUserEmail === "dm@eryndor.local") {
    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.onclick = () => openEditModal(id, data);
    card.appendChild(editBtn);
  }

  pcContainer.appendChild(card);
}
