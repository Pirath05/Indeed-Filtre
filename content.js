// ============================================================
// Indeed Filtre Écoles & Alternances — content.js
// ============================================================

const SCHOOL_KEYWORDS = [
  // Noms génériques d'écoles
  "école", "ecole", "school", "institut", "institute",
  "académie", "academie", "academy", "campus", "université",
  "universite", "university", "formation", "lycée", "lycee",
  "centre de formation", "cfa ", "cfa,", "(cfa)", "apprentissage",
  "promotion", "promo ",

  // Noms d'écoles connues (françaises)
  "efap", "iseg", "iscom", "iscpa", "iéseg", "ieseg",
  "epitech", "hetic", "ynov", "supinfo", "web@cademie",
  "web academie", "openclassrooms", "studi", "m2i",
  "greta", "afpa", "cesi", "3il", "supdevinci", "sup de vinci",
  "ingesup", "isefac", "esgi", "epsi", "ada tech school",
  "le wagon", "simplon", "o'clock", "oclock", "wild code school",
  "ironhack", "hager group école", "esgi paris",
  "eemi", "iim", "sup'internet", "digital campus",
  "bac+2", "bac+3", "bac +2", "bac +3",
  "mastère", "master en alternance", "bachelor en alternance",

  // Phrases révélatrices
  "recrute pour le compte",
  "recrute pour nos partenaires",
  "intégrer notre école",
  "rejoindre notre formation",
  "notre programme",
  "entreprise partenaire",
  "entreprises partenaires",
  "notre réseau d'entreprises",
  "gratuit pour l'entreprise",
  "sans coût pour l'employeur",
  "prise en charge à 100%",
  "0 coût pour",
  "financement opco",
  "nous recherchons une entreprise",
  "trouver une entreprise",
  "trouver ton entreprise",
  "trouver son entreprise",
  "trouver votre entreprise",
  "en cours de recherche d'entreprise",
  "cherche entreprise",
  "candidat en recherche",
  "étudiant cherche",
  "notre étudiant",
  "nos étudiants",
  "notre apprenant",
];

const SUSPICION_LEVELS = {
  HIGH: { label: "🚨 École / Arnaque alternance", color: "#ff3b3b", bg: "#fff0f0", border: "#ff3b3b" },
  MEDIUM: { label: "⚠️ Suspect — vérifier", color: "#ff8c00", bg: "#fff8f0", border: "#ffb347" },
};

let settings = {
  enabled: true,
  hideAnnouncements: false,
  highlightLevel: "both", // "high", "medium", "both"
  stats: { flagged: 0, hidden: 0 },
};

// Load settings from storage
browser.storage.local.get(["enabled", "hideAnnouncements", "highlightLevel"]).then((stored) => {
  if (stored.enabled !== undefined) settings.enabled = stored.enabled;
  if (stored.hideAnnouncements !== undefined) settings.hideAnnouncements = stored.hideAnnouncements;
  if (stored.highlightLevel !== undefined) settings.highlightLevel = stored.highlightLevel;
  scanPage();
});

// Listen for settings changes from popup
browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "UPDATE_SETTINGS") {
    settings = { ...settings, ...msg.settings };
    resetPage();
    scanPage();
  }
  if (msg.type === "GET_STATS") {
    browser.runtime.sendMessage({ type: "STATS", stats: settings.stats });
  }
});

function analyzeText(text) {
  const lower = text.toLowerCase();
  let score = 0;
  const hits = [];

  for (const kw of SCHOOL_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      score++;
      hits.push(kw);
    }
  }

  if (score >= 3) return { level: "HIGH", score, hits };
  if (score >= 1) return { level: "MEDIUM", score, hits };
  return null;
}

function getJobCards() {
  // Indeed uses various selectors depending on the version
  const selectors = [
    ".job_seen_beacon",
    ".tapItem",
    ".jobsearch-ResultsList > li",
    "[data-testid='slider_item']",
    ".result",
    "li.css-1m4cuuf",
    ".resultContent",
  ];

  let cards = [];
  for (const sel of selectors) {
    const found = document.querySelectorAll(sel);
    if (found.length > 0) {
      cards = Array.from(found);
      break;
    }
  }
  return cards;
}

function buildBadge(analysis) {
  const level = SUSPICION_LEVELS[analysis.level];
  const badge = document.createElement("div");
  badge.className = "ief-badge";
  badge.dataset.iefLevel = analysis.level;

  badge.innerHTML = `
    <span class="ief-badge-label">${level.label}</span>
    <span class="ief-badge-detail">Indices : ${analysis.hits.slice(0, 3).join(", ")}${analysis.hits.length > 3 ? "…" : ""}</span>
    <button class="ief-dismiss" title="Ignorer ce signalement">✕</button>
  `;

  badge.style.cssText = `
    background: ${level.bg};
    border-left: 4px solid ${level.border};
    color: ${level.color};
    border-radius: 4px;
    padding: 6px 10px;
    margin-top: 8px;
    font-size: 12px;
    font-family: system-ui, sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    position: relative;
    z-index: 10;
  `;

  return badge;
}

function flagCard(card, analysis) {
  if (card.dataset.iefProcessed) return;
  card.dataset.iefProcessed = "true";
  card.dataset.iefLevel = analysis.level;

  const level = SUSPICION_LEVELS[analysis.level];

  // Apply overlay style to the card
  card.style.outline = `2px solid ${level.border}`;
  card.style.borderRadius = "8px";
  card.style.position = "relative";

  if (settings.hideAnnouncements && analysis.level === "HIGH") {
    card.style.display = "none";
    settings.stats.hidden++;
    return;
  }

  // Insert badge inside the card
  const badge = buildBadge(analysis);
  const target = card.querySelector(".jobMetaDataGroup, .heading4, h2, .jobTitle, .result-title") || card;
  target.insertAdjacentElement("afterend", badge);

  badge.querySelector(".ief-dismiss").addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    card.style.outline = "";
    badge.remove();
    card.dataset.iefDismissed = "true";
  });

  settings.stats.flagged++;
}

function scanPage() {
  if (!settings.enabled) return;

  const cards = getJobCards();

  cards.forEach((card) => {
    if (card.dataset.iefDismissed) return;

    const text = card.innerText || card.textContent || "";
    const analysis = analyzeText(text);

    if (!analysis) return;

    if (settings.highlightLevel === "high" && analysis.level !== "HIGH") return;
    if (settings.highlightLevel === "medium" && analysis.level !== "MEDIUM") return;

    flagCard(card, analysis);
  });

  // Update badge count in toolbar
  browser.runtime.sendMessage({
    type: "UPDATE_COUNT",
    count: settings.stats.flagged,
  }).catch(() => {});
}

function resetPage() {
  settings.stats = { flagged: 0, hidden: 0 };
  document.querySelectorAll("[data-ief-processed]").forEach((el) => {
    el.removeAttribute("data-ief-processed");
    el.removeAttribute("data-ief-level");
    el.style.outline = "";
    el.style.display = "";
  });
  document.querySelectorAll(".ief-badge").forEach((b) => b.remove());
}

// Watch for dynamically loaded results (Indeed loads results via JS)
const observer = new MutationObserver((mutations) => {
  let shouldScan = false;
  for (const m of mutations) {
    if (m.addedNodes.length > 0) {
      shouldScan = true;
      break;
    }
  }
  if (shouldScan) {
    setTimeout(scanPage, 400);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
