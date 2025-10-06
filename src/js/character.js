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
  const header = document.getElementById("charHeader");

  if(!charData) {
    header.innerHTML = "<p>Error: No Character Data Found. <p>";
    return;
  }

  const classList = Object.entries(charData.class || {}).map(([cls, lvl]) => `${capitalize(cls)} ${lvl}`).join(" / ");

  const totalLevel = Object.values(charData.class || {}).reduce((a, b) => a + b, 0);

  header.innerHTML = `
    <div class="char-header-block">
      <h1>${charData.name || "Unnamed Adventurer"}</h1>
      <p><strong>Race:</strong> ${charData.race || "Unknown Race"}
      <strong>Classes:</strong> ${classList || "No Class"} (Lvl ${totalLevel})
      <strong>AC:</strong> ${charData.ac ?? "—"} | <strong>HP:</strong> ${charData.hp?.current ?? "?"} / ${charData.hp?.max ?? "?"}
      <strong>Proficiency Bonus:</strong> +${charData.proficiencyBonus ?? "?"}</p>
    </div>
  `;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderCharacterStats(charData) {
  const statsEl = document.getElementById("statList");
  statsEl.innerHTML = "";
  for (const [stat, value] of Object.entries(charData.stats)) {
    const li = document.createElement("li");
    li.textContent = `${stat.toUpperCase()}: ${value}`;
    statsEl.appendChild(li);
  }
}

async function loadCharacterInventory(charId) {
  const invRef = db.collection("characters").doc(charId).collection("inventory");

  try {
    const invSnap = await invRef.get();
    const inventoryItems = [];

    for (const doc of invSnap.docs) {
      const invData = doc.data();
      const itemId = invData.itemId || doc.id;

      // Get static item info
      const itemDoc = await db.collection("items").doc(itemId).get();
      const itemData = itemDoc.exists ? itemDoc.data() : {};

      // Combine static + dynamic data
      const mergedItem = {
        id: doc.id,
        ...itemData,   // global catalog (type, damage, etc.)
        ...invData     // player-specific (quantity, equipped, notes)
      };

      inventoryItems.push(mergedItem);
    }

    renderInventory(inventoryItems);
  } catch (error) {
    console.error("Failed to load inventory:", error);
  }
}

function renderInventory(items) {
  const tableBody = document.querySelector("#inventoryTable tbody");
  tableBody.innerHTML = "";

  if(!items || items.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5"><em>No items found.</em></td></tr>`;
    return;
  }

  items.forEach(item => {
    //Extract Relevant Info Safely
    const name = item.name || item.id || "Unknown Item";
    const type = item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : "-";
    const weight = item.weight ? `${item.weight} lb` : "-";
    const equipped = item.equipped ? "✅" : "";
    const qty = item.quantity ?? 1;

    const row = document.createElement("tr");

    row.innerHTML = `
      <tr>${name}</tr>
      <td>${type}</td>
      <td>${weight}</td>
      <td class = "center">${equipped}</td>
      <td>${qty}</td>
    `;

    row.title = buildItemTooltip(item);

    tableBody.appendChild(row);
  });
}

function buildItemTooltip(item) {
  const lines = [];

  if(item.baseDamage) {
    lines.push(`Damage: ${item.baseDamage.diceCount}d${item.baseDamage.diceValue} ${item.baseDamage.damageType}`);
  }

  if(item.properties?.length) {
    lines.push(`Properties: ${item.properties.join(", ")}`);
  }

  if(item.armotType) {
    lines.push(`Armor Type: ${item.armorType}`);
  }

  if (item.notes) {
    lines.push(`Notes: ${item.notes}`);
  }

  return lines.join(" • ")
}