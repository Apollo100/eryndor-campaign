// inventory-view.js
// Requires: firebase-init.js, nav.js

document.addEventListener("DOMContentLoaded", () => {
  waitForAuthReady().then(user => {
    if (!user) {
      document.getElementById("main-content").innerHTML =
        "<p>Please log in to view your character.</p>";
      return;
    }
    loadCharacterByOwner(user.uid);
  });
});

function waitForAuthReady() {
  return new Promise(resolve => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    });
  });
}

async function loadCharacterByOwner(userId) {
  if (!userId) {
    console.error("User ID undefined — cannot load character.");
    return;
  }

  const charQuery = await db.collection("characters")
    .where("owner", "==", userId)
    .get();
  if (!charQuery || charQuery.empty) {
    document.getElementById("main-content").innerHTML =
      "<p>No character found for this account.</p>";
    return;
  }

  const charDoc = charQuery.docs[0];
  const charData = charDoc.data();
  const charId = charDoc.id;

  renderCharacterHeader(charData);
  renderCharacterStats(charData);

  // Inventory subcollection
  await loadCharacterInventory(charId);
}



function renderCharacterHeader(charData) {
  // Character name
  document.getElementById("charName").textContent = charData.name;

  // Tags (race, classes, proficiency)
  const tagContainer = document.getElementById("charTags");
  tagContainer.innerHTML = "";

  const raceTag = `<span class="tag">${charData.race}</span>`;
  const profTag = `<span class="tag">+${charData.proficiencyBonus} PROF</span>`;
  
  const classTags = Object.entries(charData.class)
    .map(([cls, lvl]) => `<span class="tag">${cls} Lv.${lvl}</span>`)
    .join("");

  tagContainer.innerHTML = raceTag + classTags + profTag;

  // AC & HP
  document.getElementById("charAC").textContent = charData.ac || "—";
  document.getElementById("charHP").textContent = `${charData.hp.current} / ${charData.hp.max}`;
  document.getElementById("charProf").textContent = charData.proficiencyBonus || 0;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderCharacterStats(charData) {
  const statsEl = document.getElementById("charStats");
  statsEl.innerHTML = "";

  for (const [stat, value] of Object.entries(charData.stats)) {
    const mod = Math.floor((value - 10) / 2);
    const div = document.createElement("div");
    div.classList.add("card", "p-md");
    div.innerHTML = `
      <strong>${stat.toUpperCase()}</strong><br>
      <span>${value}</span> 
      <span class="text-muted">(${mod >= 0 ? "+" : ""}${mod})</span> 
    `;
    statsEl.appendChild(div);
  }
}

async function loadCharacterInventory(charId) {
  const invRef = db.collection("characters").doc(charId).collection("inventory");
  const invSnap = await invRef.get();

  const invDocs = invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const itemIds = invDocs.map(i => i.itemId || i.id);

  // Batch fetch static items in parallel
  const itemFetches = itemIds.map(id => db.collection("items").doc(id).get());
  const itemSnaps = await Promise.all(itemFetches);

  const itemsById = {};
  itemSnaps.forEach(snap => {
    if (snap.exists) itemsById[snap.id] = snap.data();
  });

  const merged = invDocs.map(invItem => ({
    ...itemsById[invItem.itemId || invItem.id],
    ...invItem
  }));

  renderInventory(merged);
}

function renderInventory(items) {
  const tagContainer = document.getElementById("inventoryTags");
  const bodyContainer = document.getElementById("inventoryBody");

  tagContainer.innerHTML = "";
  bodyContainer.innerHTML = "";

  if (!items || items.length === 0) {
    bodyContainer.innerHTML = "<p>No items in inventory.</p>";
    return;
  }

  // 1️⃣ Group items by type
  const grouped = items.reduce((acc, item) => {
    const type = item.type?.toLowerCase() || "misc";
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  // 2️⃣ Create tags for each section
  for (const [type, group] of Object.entries(grouped)) {
    const tag = document.createElement("span");
    tag.classList.add("tag", "inventory-tag");
    tag.textContent = `${type.toUpperCase()} (${group.length})`;
    tagContainer.appendChild(tag);
  }

  // 3️⃣ Create section cards for each type
  for (const [type, groupItems] of Object.entries(grouped)) {
    const typeCard = document.createElement("div");
    typeCard.classList.add("inventory-category-card", "card");

    typeCard.innerHTML = `
      <div class="card-header">
        <h3>${type.toUpperCase()}</h3>
        <span class="tag">${groupItems.length} item${groupItems.length !== 1 ? "s" : ""}</span>
      </div>
      <div class="card-body inventory-items-grid"></div>
    `;

    const itemsContainer = typeCard.querySelector(".inventory-items-grid");

    // 4️⃣ Create item cards inside this category
    groupItems.forEach(item => {
      const itemCard = document.createElement("div");
      itemCard.classList.add("inventory-item-card", "card", `rarity-${item.rarity || "common"}`);

      let extraDetails = "";

      if (item.type === "weapon" && item.baseDamage) {
        const dmg = item.baseDamage;
        if (dmg.diceCount && dmg.diceValue) {
          extraDetails = `${dmg.diceCount}d${dmg.diceValue} ${dmg.damageType || ""}`;
        } else if (dmg.damageDice) {
          extraDetails = `${dmg.damageDice} ${dmg.damageType || ""}`;
        }
      } else if (item.type === "armor") {
        if (item.armorClass && typeof item.armorClass === "object") {
          extraDetails = `AC ${item.armorClass.base || ""} +${item.armorClass.bonus || 0}`;
        } else if (item.acBonus) {
          extraDetails = `AC +${item.acBonus}`;
        }
      }

      console.log(extraDetails);

      itemCard.innerHTML = `
        <div class="card-header">
          <h4>${item.name || item.id}</h4>
          ${item.equipped ? '<span class="tag equipped">Equipped</span>' : ""}
        </div>
        <div class="card-body">
          <p><strong>Weight:</strong> ${item.weight ?? "—"} lb</p>
          <p><strong>Quantity:</strong> ${item.quantity ?? 1}</p>
          ${extraDetails ? `<p><em>${extraDetails}</em></p>` : ""}
          ${item.notes ? `<p class="notes">${item.notes}</p>` : ""}
        </div>
      `;

      itemsContainer.appendChild(itemCard);
      
    });

    bodyContainer.appendChild(typeCard);
  }
}

document.addEventListener("click", e => {
  const header = e.target.closest(".card-header");
  if (!header) return;

  const card = header.closest(".card");
  if (!card) return;

  const body = card.querySelector(".card-body");
  if (!body) return;

  // Stop clicks from triggering parent cards too
  e.stopPropagation();

  body.classList.toggle("expanded");
  header.classList.toggle("expanded");
});