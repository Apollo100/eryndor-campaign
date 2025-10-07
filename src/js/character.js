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

    // 4️⃣ Process items - handle stackable vs non-stackable differently
    const processedItems = processItemsForDisplay(groupItems);
    
    // 5️⃣ Create item cards
    processedItems.forEach(processedItem => {
      const itemCard = createItemCard(processedItem);
      itemsContainer.appendChild(itemCard);
    });

    bodyContainer.appendChild(typeCard);
  }
}

// Helper function to process items for display
function processItemsForDisplay(items) {
  const processed = [];
  
  items.forEach(item => {
    const isStackable = item.isStackable || false;
    const quantity = item.quantity || 1;
    
    if (isStackable) {
      // Stackable items: create ONE card with quantity display
      processed.push({
        ...item,
        displayType: 'stack',
        displayQuantity: quantity
      });
    } else {
      // Non-stackable items: create INDIVIDUAL cards for each item
      for (let i = 0; i < quantity; i++) {
        processed.push({
          ...item,
          displayType: 'individual',
          instanceNumber: i + 1,
          displayQuantity: 1
        });
      }
    }
  });
  
  return processed;
}

// Helper function to create individual item cards
function createItemCard(processedItem) {
  const itemCard = document.createElement("div");
  const rarityClass = `rarity-${processedItem.rarity || "common"}`;
  const stackableClass = processedItem.displayType === 'stack' ? 'stackable-item' : 'individual-item';
  
  itemCard.classList.add("inventory-item-card", "card", rarityClass, stackableClass);

  let extraDetails = "";
  if (processedItem.type === "weapon" && processedItem.baseDamage) {
    const dmg = processedItem.baseDamage;
    if (dmg.diceCount && dmg.diceValue) {
      extraDetails = `${dmg.diceCount}d${dmg.diceValue} ${dmg.damageType || ""}`;
    } else if (dmg.damageDice) {
      extraDetails = `${dmg.damageDice} ${dmg.damageType || ""}`;
    }
    
    // Add properties info
    if (processedItem.properties && processedItem.properties.length > 0) {
      extraDetails += ` [${processedItem.properties.join(', ')}]`;
    }
  } else if (processedItem.type === "armor") {
    if (processedItem.armorClass && typeof processedItem.armorClass === "object") {
      extraDetails = `AC ${processedItem.armorClass.base || ""} +${processedItem.armorClass.bonus || 0}`;
    } else if (processedItem.acBonus) {
      extraDetails = `AC +${processedItem.acBonus}`;
    }
  }

  // Build card with appropriate display
  const isEquipped = processedItem.equipped || false;
  const isStackable = processedItem.isStackable || false;
  
  // Determine title (clean without numbers)
  let title = processedItem.name || processedItem.id;
  
  // For stackable items, quantity will be shown in the tag area
  // For individual items, no instance numbers - clean title only

  itemCard.innerHTML = `
    <div class="card-header">
      <h4>${title}</h4>
      <div class="item-actions">
        <span class="tag ${isEquipped ? "equipped" : "equip-toggle"}" 
              data-itemid="${processedItem.id}" 
              data-instance="${processedItem.instanceNumber || 1}"
              data-equipped="${isEquipped}">
          ${isEquipped ? "Equipped ✅" : "Equip"}
        </span>
        ${processedItem.displayType === 'stack' ? `
          <span class="tag quantity-tag">Qty: ${processedItem.displayQuantity}</span>
        ` : ''}
      </div>
    </div>
    <div class="card-body">
      <p><strong>Type:</strong> ${processedItem.type || "Unknown"}</p>
      <p><strong>Weight:</strong> ${processedItem.weight ?? "—"} lb</p>
      ${processedItem.properties && processedItem.properties.length > 0 ? 
        `<p><strong>Properties:</strong> ${processedItem.properties.join(', ')}</p>` : ""}
      ${extraDetails ? `<p><em>${extraDetails}</em></p>` : ""}
      ${processedItem.notes ? `<p class="notes">${processedItem.notes}</p>` : ""}
    </div>
  `;

  return itemCard;
}

document.addEventListener("click", async (e) => {
  // First, check if click is on an equip button
  if (e.target.classList.contains("equip-toggle") || e.target.classList.contains("equipped")) {
    const itemId = e.target.dataset.itemid;
    const currentlyEquipped = e.target.dataset.equipped === "true";
    
    if (!itemId) return;
    
    // Show loading state
    const originalText = e.target.textContent;
    e.target.textContent = "Updating...";
    e.target.disabled = true;
    
    try {
      await toggleEquipItem(itemId, !currentlyEquipped);
      
      // Reload the character data to reflect changes
      const user = auth.currentUser;
      if (user) {
        await loadCharacterByOwner(user.uid);
      }
    } catch (error) {
      console.error("Error updating equipment:", error);
      alert(error.message);
      // Reset button state on error
      e.target.textContent = originalText;
      e.target.disabled = false;
    }
    
    // Stop propagation since we handled this click
    e.stopPropagation();
    return;
  }
  
  // Then, check if click is on a card header (for expand/collapse)
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

async function toggleEquipItem(itemId, equipState) {
  console.log(`=== TOGGLE EQUIP START ===`);
  console.log(`Item: ${itemId}, Equip: ${equipState}`);
  
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");
  
  const charQuery = await db.collection("characters").where("owner", "==", user.uid).get();
  if (charQuery.empty) throw new Error("Character not found");
  
  const charId = charQuery.docs[0].id;
  const inventoryRef = db.collection("characters").doc(charId).collection("inventory");
  
  // Get ALL inventory items for debugging
  const allInventoryItems = await inventoryRef.get();
  console.log('All inventory items:');
  
  // First, get all base item data for the inventory
  const inventoryWithBaseData = await Promise.all(
    allInventoryItems.docs.map(async (doc) => {
      const invData = doc.data();
      const baseItemId = invData.itemId || doc.id;
      const baseItemDoc = await db.collection("items").doc(baseItemId).get();
      const baseData = baseItemDoc.exists ? baseItemDoc.data() : {};
      
      console.log(`- ${doc.id}:`, {
        inventory: invData,
        base: baseData
      });
      
      return {
        id: doc.id,
        inventoryData: invData,
        baseData: baseData
      };
    })
  );
  
  // Get current item data
  const currentItem = inventoryWithBaseData.find(item => item.id === itemId);
  if (!currentItem) throw new Error("Current item not found in inventory");
  
  console.log(`Current item:`, currentItem);
  
  const batch = db.batch();
  
  if (equipState && currentItem.baseData.type === 'weapon') {
    console.log('Equipping weapon - checking for other equipped weapons');
    
    // Find all currently equipped weapons by checking base data
    const equippedWeapons = inventoryWithBaseData.filter(item => 
      item.baseData.type === 'weapon' &&  item.inventoryData.equipped
    );
    
    console.log(`Found ${equippedWeapons.length} equipped weapons:`, equippedWeapons.map(w => w.id));
    
    // Check if current weapon is two-handed
    const isTwoHanded = currentItem.baseData.properties && Array.isArray(currentItem.baseData.properties) && currentItem.baseData.properties.includes('Two-Handed');
    
    // Check if any equipped weapon is two-handed
    const hasTwoHandedEquipped = equippedWeapons.some(weapon =>
      weapon.baseData.properties && 
      Array.isArray(weapon.baseData.properties) && 
      weapon.baseData.properties.includes('Two-Handed')
    );
    
    console.log(`Current is two-handed: ${isTwoHanded}, Has two-handed equipped: ${hasTwoHandedEquipped}`);
    
    // Apply equipment rules
    if (isTwoHanded || hasTwoHandedEquipped) {
      // Two-handed rule: unequip all other weapons
      equippedWeapons.forEach(weapon => {
        if (weapon.id !== itemId) {
          console.log(`Unequipping weapon due to two-handed rule: ${weapon.id}`);
          batch.update(inventoryRef.doc(weapon.id), {
            equipped: false,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      });
    } else if (equippedWeapons.length >= 2) {
      throw new Error("You can only equip 2 weapons at once");
    }
    
    // Equip the current weapon
    batch.update(inventoryRef.doc(itemId), {
      equipped: true,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    
  } else if (equipState && currentItem.baseData.type === 'armor') {
    console.log('Equipping armor - unequipping other armor');
    
    // Find all equipped armor
    const equippedArmor = inventoryWithBaseData.filter(item => 
      item.baseData.type === 'armor' && item.inventoryData.equipped
    );
    
    // Unequip other armor
    equippedArmor.forEach(armor => {
      if (armor.id !== itemId) {
        batch.update(inventoryRef.doc(armor.id), {
          equipped: false,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    });
    
    // Equip current armor
    batch.update(inventoryRef.doc(itemId), {
      equipped: true,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    
  } else {
    // Simple toggle for non-weapon/armor items or unequipping
    batch.update(inventoryRef.doc(itemId), {
      equipped: equipState,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
  
  await batch.commit();
  console.log('Batch committed successfully');
  console.log(`=== TOGGLE EQUIP END ===`);
}