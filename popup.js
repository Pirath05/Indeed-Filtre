// popup.js — Gestion de l'interface du popup

const $ = (id) => document.getElementById(id);

// Load saved settings
browser.storage.local.get(["enabled", "hideAnnouncements", "highlightLevel", "stats"]).then((stored) => {
  $("toggleEnabled").checked = stored.enabled !== false;
  $("toggleHide").checked = stored.hideAnnouncements === true;
  $("selectLevel").value = stored.highlightLevel || "both";

  updateStatusUI($("toggleEnabled").checked);

  if (stored.stats) {
    $("countFlagged").textContent = stored.stats.flagged || 0;
    $("countHidden").textContent = stored.stats.hidden || 0;
  } else {
    $("countFlagged").textContent = "0";
    $("countHidden").textContent = "0";
  }
});

function updateStatusUI(enabled) {
  const dot = $("statusDot");
  const text = $("statusText");
  if (enabled) {
    dot.classList.remove("off");
    text.textContent = "Actif sur Indeed";
  } else {
    dot.classList.add("off");
    text.textContent = "Filtre désactivé";
  }
}

function saveAndApply() {
  const settings = {
    enabled: $("toggleEnabled").checked,
    hideAnnouncements: $("toggleHide").checked,
    highlightLevel: $("selectLevel").value,
  };

  browser.storage.local.set(settings);
  updateStatusUI(settings.enabled);

  // Send to active Indeed tab
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (tabs[0]) {
      browser.tabs.sendMessage(tabs[0].id, {
        type: "UPDATE_SETTINGS",
        settings,
      }).catch(() => {});
    }
  });
}

$("toggleEnabled").addEventListener("change", saveAndApply);
$("toggleHide").addEventListener("change", saveAndApply);
$("selectLevel").addEventListener("change", saveAndApply);

$("refreshBtn").addEventListener("click", () => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (tabs[0]) {
      browser.tabs.reload(tabs[0].id);
      setTimeout(() => window.close(), 300);
    }
  });
});
