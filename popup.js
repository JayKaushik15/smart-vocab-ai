// Smart Vocab AI - Popup Script

const toggle = document.getElementById("enableToggle");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveBtn = document.getElementById("saveBtn");
const savedMsg = document.getElementById("savedMsg");

// Load saved state
chrome.storage.local.get(["svEnabled", "geminiApiKey"], (res) => {
  const enabled = res.svEnabled || false;
  toggle.checked = enabled;
  updateStatus(enabled);

  if (res.geminiApiKey) {
    apiKeyInput.value = res.geminiApiKey;
  }
});

// Toggle enable/disable
toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ svEnabled: enabled });
  updateStatus(enabled);

  // Inject into current active tab if enabling
  if (enabled) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content.js"]
        }).catch(() => {}); // already injected is fine
      }
    });
  }
});

// Save API key
saveBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (!key) return;
  chrome.storage.local.set({ geminiApiKey: key }, () => {
    savedMsg.classList.add("show");
    setTimeout(() => savedMsg.classList.remove("show"), 2500);
  });
});

function updateStatus(enabled) {
  statusDot.classList.toggle("active", enabled);
  statusText.textContent = enabled
    ? "Extension is active — hover any word!"
    : "Extension is inactive";
  statusText.style.color = enabled
    ? "rgba(52, 211, 153, 0.75)"
    : "rgba(255,255,255,0.28)";
}
