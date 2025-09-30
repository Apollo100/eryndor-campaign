import { auth, db  } from './main.js';

const svg = document.getElementById("mapSVG");
let isPanning = false;
let startX, startY;
let scale = 1;
let panX = 0, panY = 0;

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("kingdomModal");
    const modalContent = document.querySelector(".map-modal-content");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalClose = document.querySelector(".map-modal-close");

    const kingdomData = {
        "k-valor": {
            title: "Valor, The Empire of Flame",
            description: "A fiery militaristic empire built on discipline, honor, and conquest, Valor thrives on strict hierarchy and battlefield prowess. Its cities burn with the glow of forges and training grounds, producing elite warriors and blazing banners.",
            ruler: "Aldric FlameReign",
            name: "valor",
            capital: "Pyrehold",
            race: "Human",
            symbol: "🦁",
            quickFacts: {
                god: "Seraphine (FireBringer)",
                government: "Imperial Monarchy",
                strength: "Skilled Armies, Siegecraft, Disciplined Society, Enduring Morale",
                weakness: "Overextension Due To Decades Long Wars, Reliant On Human Soldiers"
            },
            link: "#"
          },

          "k-aleri": {
            title: "Aleri, The Sky Confederation",
            description: "A confederation of skyborne islands and wind-swept highlands, Aleri excels in trade, navigation, and agile aerial combat. Its people prize cunning and adaptability, weaving diplomacy with mastery of the skies.",
            ruler: "Serion Vaelaris",
            name: "aleri",
            capital: "Skyreach",
            race: "Elven",
            symbol: "🍃",
            quickFacts: {
                god: "None",
                government: "Confederation",
                strength: "Aerial Superiority, Agility, Archery, Magical Wind Manipulation",
                weakness: "Physically Fragile, Small Population, Limited Resources"
            },
            link: "#"
          },

          "k-draemir": {
            title: "Draemir, The Mountain Hold",
            description: "Feudal and stonebound, Draemir’s mountains are rich with minerals and ancient secrets, including the sealed CogBound. Its people are enduring and stoic, masters of earth and craft.",
            ruler: "Hroger BlackIron",
            name: "draemir",
            capital: "BlakcIron Hold",
            race: "Dwarves",
            symbol: "🏔️",
            quickFacts: {
              god: "Thorne (Stone Father)",
              government: "Feudal Monarchy",
              strength: "Master Craftmen, Siege Resistant, Mountain Fortresses, Sttable Economy",
              weakness: "Slow Expansion, Insular, Difficult Diplomacy"
            },
            link: "#"
          },

          "k-serathis": {
            title: "Serathis, Thalassocracy of Tides",
            description: "A waterborne kingdom of flowing canals, rivers, and coastal cities, Serathis is ruled by wisdom and strategic mastery of tides and trade. Its artisans and mages imbue water into both life and enchantment.",
            ruler: "Lysandra Tideborne",
            name: "serathis",
            capital: "Pearlspeak",
            race: "Half-Elves",
            symbol: "🌊",
            quickFacts: {
              god: "Faelara (The Vieled Moon)",
              government: "Maritime Monarchy",
              strength: "Naval Power Trade Networks, Diplomacy, Magic Expertise",
              weakness: "Heavily Depend on Trade, Weak Inland, Divided Politics"
            },
            link: "#"
          },

          "k-thryssia": {
            title: "The Magocractic Principality of Thryssia",
            description: "A principality of magical experimentation, Thryssia blends arcane science and alchemical transmutations, where scholars manipulate life and matter. It's streets are full of laboratories, , elemental chaos, and ambitious mages.",
            ruler: "Maltheris Veythros",
            name: "thryssia",
            capital: "Transmutis",
            race: "Gnomes",
            symbol: "🐺",
            quickFacts: {
              god: "None",
              government: "Magrocactic Principality",
              strength: "Magical Innovation, Transmutation Mastery, Experimental Tech",
              weakness: "Small Population, Limited Allies, Political Inexperience"
            },
            link: "#"
          },

          "k-kaelvyrn": {
            title: "The Holy Arcane theocracy of Kaelvyrn",
            description: "An aracen theocracy steeped in summonuing and conjuration, Kaelvyrn wields its magical elite to maintain rigid control over both people and spirtis. Temples double as summoning chambers, their spires piercing the skies.",
            ruler: "Kaeler Duskbane",
            name: "kaelvyrn",
            capital: "Luminaris",
            race: "Humans",
            symbol: "🐉",
            quickFacts: {
              god: "Symire",
              government: "Arcane Theocracy",
              strength: "Divine Magic, Celestial Authority, Strong Hierarchy",
              weakness: "Bureaucratic Rigidity, Limited Manpower, Reliant on Magical Power"
            }
          },

          "k-veyra": {
            title: "Holy Protectorate of Veyra",
            description: "A holy protectorate defined by law, order, and the divine guardianship, Veyra citadels and towers safeguard sacred knowledge and enforce justice. its knights and clerics patrol both borders and hearts with unwavering resolve.",
            ruler: "Caelen Sunshield",
            name: "veyra",
            capital: "Dawn's Keep",
            race: "Aasimar",
            symbol: "🦅",
            quickFacts: {
              god: "None - Sworn To The Aether",
              government: "Holy Protectorate",
              strength: "Righteous Armies, Fortified Sanctuaries, Healing Orders",
              weakness: "Dogmatic Zeal, Inflexible Doctrine, Lack Of Invovation"
            }
          },

          "k-myrrdain": {
            title: "The Magocracy of Myrrdain",
            description: "A scholarly magocracy, Myrrdain preserves ancient knowledge and pursues arcane innovation, housing sprawling libraries, observatories, and magical academies. Its sages are revered as arbitors of wisdom, secrecy, and foresight.",
            ruler: "Merelith Quillborne",
            name: "myrrdain",
            capital: "Quillspire",
            race: "Dwarves & Gnomes",
            symbol: "🦉",
            quickFacts: {
              god: "None",
              government: "Scholarly Magocracy",
              strength: "Scholarly Mastery, Magical Archives, Neutral Diplomacy",
              weakness: "Militarily Weak, Factional Infighting, Viewed As Amoral"
            }
          },

          "k-norveth": {
            title: "Federation of Norveth",
            description: "A federation of clans and demihumans in the wilds, Norveth prizes freedonm, honor, and  the harmony between nature and society. Clans rise and fall through counsel and skill, their leaders forged in trial and battle.",
            ruler: "Razael Ironjaw",
            name: "norveth",
            capital: "Clawhold",
            race: "Demi-Humans",
            symbol: "🐾",
            quickFacts: {
              god: "Cernunnos The Untamed One",
              government: "Federation of Clans",
              strength: "Guerilla Tactics, BeastFolk Abilities, Strong Survival Traditions",
              weakness: "Poor Central Authority, Limited Industry, Fractured Leadership"
            }
          },

          "k-gilded-league": {
            title: "The Gilded League of Unbaked Clans",
            description: "A mercantile alliance of city-states, the Gilded League thrives on trade, wealth accumulation, and political cunning. Its gilded streets sparkle with commerce, secrecy, and calculated ambition.",
            ruler: "Marrow Khazark",
            name: "gilded-league",
            capital: "Coinhaven",
            race: "Half-Orcs (Unbaked Ones)",
            symbol: "🪙",
            quickFacts: {
              god: "Pan The Dreaming One",
              government: "Merchant Oligarchy",
              strength: "Ruthless Merchants, Pirate Fleets, Criminal Underworld Control, Mastery of Coin",
              weakness: "Fractured Loyalty, Born of Resentment, Militarily Oppurtunistic Not Discipline"
            }
          },

          "k-sugarspire": {
            title: "Confectioners of The Sugar Spire",
            description: "An isolated archipelago of orcish bakers and creators, the Sugar Spire lives for culinary perfection, mystical pastries, and ritual combat reproduction,. Its society celebrates brotherhood, artistry, and chaotic whimsy.",
            ruler: "Brokk Sugarmaul",
            name: "sugarspire",
            capital: "Fondantine",
            race: "Orcs",
            symbol: "🧁",
            quickFacts: {
              god: "Pan The Dreaming One",
              government: "Pastry Brotherhood",
              strength: "Legendary Pastries, Abolitionist Values, Gentle Giants",
              weakness: "Mocked As Cake Savages, Naive In Politics, Vulnerable To Shadow Corruption"
            }
          }

    }

    //Detect Mobile Verusu Desktop
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    //Last Time Tapped
    let lastTapTime = 0;

    document.querySelectorAll(".kingdom-path").forEach(path => {
        path.addEventListener("click", e => {
            if(!isMobile) {
                openModal(e.target.id);
            }
        });

        path.addEventListener("touchend", e => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;

            if (tapLength < 300 && tapLength > 0) {
                openModal(e.target.id);
            }

            lastTapTime = currentTime;
        });
    });

    function openModal(kingdomId) {

        //Modal Specifics
        const modalFacts = document.getElementById("modal-quick-facts");
        const modalLink = document.getElementById("modal-link");

        const data = kingdomData[kingdomId];
        if(!data) return;

        //Display Text
        modalTitle.textContent = `${data.symbol} ${data.title}`;
        modalDescription.textContent = kingdomData[kingdomId].description;

        //Reset Modal Classes
        modalContent.className = "map-modal-content";

        //Add Kingdom-Specific Class
        modalContent.classList.add(data.name);

        //Populate Quick Facts
        modalFacts.innerHTML = `
        <li><strong>Ruling Race:</strong> ${data.race}</li>
        <li><strong>Ruler:</strong> ${data.ruler}</li>
        <li><strong>Capital:</strong> ${data.capital}</li>
        <li><strong>Patron God:</strong> ${data.quickFacts.god}</li>
        <li><strong>Gov't:</strong> ${data.quickFacts.government}</li>
        <li><strong>Strength:</strong> ${data.quickFacts.strength}</li>
        <li><strong>Weakness:</strong> ${data.quickFacts.weakness}</li>`;

        //Link To Full Lore
        modalLink.href = data.link;

        //Show Modal
        modal.style.display = "flex";
        document.body.classList.add("modal-open");
    }

    modalClose.addEventListener("click", () => {
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

    window.addEventListener("click", e => {
        if(e.target === modal) {
          modal.style.display = "none";
          document.body.classList.remove("modal-open");
        }
    });
});

function setTransform() {
    svg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
}

//Zoom With Pinch or Wheel
svg.addEventListener("wheel", e => {
    e.preventDefault();
    const zoomFactor = 0.1;
    scale += e.deltaY < 0 ? zoomFactor : -zoomFactor;
    scale = Math.min(Math.max(scale, 0.5), 3);
    setTransform();
});

//Pan With Drag
svg.addEventListener("mousedown", e => {
  isPanning = true;
  startX = e.clientX - panX;
  startY = e.clientY - panY;
});

svg.addEventListener("mousemove", e => {
  if (!isPanning) return;
  panX = e.clientX - startX;
  panY = e.clientY - startY;
  setTransform();
});

svg.addEventListener("mouseup", () => {
  isPanning = false;
});
svg.addEventListener("mouseleave", () => {
  isPanning = false;
});

// Touch pinch + pan
let touchStartDist = 0;
let lastScale = 1;

svg.addEventListener("touchstart", e => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    touchStartDist = Math.sqrt(dx*dx + dy*dy);
    lastScale = scale;
  } else if (e.touches.length === 1) {
    isPanning = true;
    startX = e.touches[0].clientX - panX;
    startY = e.touches[0].clientY - panY;
  }
});

svg.addEventListener("touchmove", e => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx*dx + dy*dy);

    scale = lastScale * (dist / touchStartDist);
    scale = Math.min(Math.max(scale, 0.5), 3);
    setTransform();
  } else if (e.touches.length === 1 && isPanning) {
    panX = e.touches[0].clientX - startX;
    panY = e.touches[0].clientY - startY;
    setTransform();
  }
});

svg.addEventListener("touchend", e => {
  if (e.touches.length < 2) {
    isPanning = false;
  }
});

//Toggle Card Expand
const cards = document.querySelectorAll(".kingdom-card");

cards.forEach(card => {
  const body = card.querySelector(".kingdom-card-body");
  card.addEventListener('click', function(e) {
    body.classList.toggle('expanded');
  });
});