// background.js
browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "UPDATE_COUNT") {
    browser.storage.local.set({ stats: { flagged: msg.count, hidden: 0 } });
  }
});
