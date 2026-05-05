// Smart Vocab AI - Content Script

(function () {
  if (window.__svInitialized) return;
  window.__svInitialized = true;

  let hoverTimer = null;
  let currentWord = "";
  let tooltipEl = null;
  let isEnabled = false;
  let lastShownWord = "";

  // Listen for enable/disable from popup
  chrome.storage.local.get("svEnabled", (res) => {
    isEnabled = res.svEnabled || false;
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.svEnabled) {
      isEnabled = changes.svEnabled.newValue;
      if (!isEnabled) removeTooltip();
    }
  });

  // ── Tooltip creation ─────────────────────────────────────────
  function createTooltip() {
    if (document.getElementById("sv-tooltip")) return;

    const el = document.createElement("div");
    el.id = "sv-tooltip";
    el.innerHTML = `
      <div class="sv-header">
        <span class="sv-logo">SV</span>
        <span class="sv-word-title" id="sv-word"></span>
        <button class="sv-close" id="sv-close">✕</button>
      </div>
      <div class="sv-body">
        <div class="sv-loading" id="sv-loading">
          <div class="sv-spinner"></div>
          <span>Looking up...</span>
        </div>
        <div class="sv-content" id="sv-content" style="display:none">
          <div class="sv-section">
            <div class="sv-label">Definition</div>
            <div class="sv-definition" id="sv-definition"></div>
          </div>
          <div class="sv-section">
            <div class="sv-label">Synonyms</div>
            <div class="sv-synonyms" id="sv-synonyms"></div>
          </div>
        </div>
        <div class="sv-error" id="sv-error" style="display:none">
          <span id="sv-error-msg"></span>
        </div>
      </div>
      <div class="sv-footer">Smart Vocab AI · Powered by Gemini</div>
    `;
    document.body.appendChild(el);
    tooltipEl = el;

    document.getElementById("sv-close").addEventListener("click", () => {
      removeTooltip();
      lastShownWord = currentWord;
    });
  }

  function removeTooltip() {
    const el = document.getElementById("sv-tooltip");
    if (el) {
      el.classList.add("sv-hide");
      setTimeout(() => el.remove(), 250);
    }
    tooltipEl = null;
  }

  function showTooltip(x, y, word) {
    if (word === lastShownWord) return;

    removeTooltip();
    createTooltip();

    document.getElementById("sv-word").textContent = word;
    document.getElementById("sv-loading").style.display = "flex";
    document.getElementById("sv-content").style.display = "none";
    document.getElementById("sv-error").style.display = "none";

    positionTooltip(x, y);
if (tooltipEl) tooltipEl.classList.add("sv-show");
    chrome.storage.local.get("geminiApiKey", (res) => {
      const apiKey = res.geminiApiKey;
      if (!apiKey) {
        showError("No API key set. Click the SV icon to add your Gemini API key.");
        return;
      }

      chrome.runtime.sendMessage(
        { type: "FETCH_DEFINITION", word, apiKey },
        (response) => {
          if (!document.getElementById("sv-tooltip")) return;
          if (response?.success) {
            populateTooltip(response.data);
          } else {
            showError(response?.error || "Failed to fetch definition.");
          }
        }
      );
    });
  }

  function positionTooltip(x, y) {
    if (!tooltipEl) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tw = 320;
    const th = 200;

    let left = x + 12;
    let top = y + 20;

    if (left + tw > vw - 10) left = x - tw - 12;
    if (top + th > vh - 10) top = y - th - 12;
    if (left < 10) left = 10;
    if (top < 10) top = 10;

    tooltipEl.style.left = left + "px";
    tooltipEl.style.top = top + "px";
  }

  function populateTooltip(data) {
    document.getElementById("sv-loading").style.display = "none";
    document.getElementById("sv-content").style.display = "block";
    document.getElementById("sv-definition").textContent = data.definition || "—";

    const synContainer = document.getElementById("sv-synonyms");
    synContainer.innerHTML = "";
    const synonyms = data.synonyms || [];
    if (synonyms.length === 0) {
      synContainer.textContent = "—";
    } else {
      synonyms.forEach(s => {
        const tag = document.createElement("span");
        tag.className = "sv-syn-tag";
        tag.textContent = s;
        synContainer.appendChild(tag);
      });
    }
  }

  function showError(msg) {
    if (!document.getElementById("sv-tooltip")) return;
    document.getElementById("sv-loading").style.display = "none";
    document.getElementById("sv-error").style.display = "block";
    document.getElementById("sv-error-msg").textContent = msg;
  }

  // ── Word extraction ──────────────────────────────────────────
  function getWordAtPoint(x, y) {
    const range = document.caretRangeFromPoint?.(x, y);
    if (!range) return null;

    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return null;

    const text = node.textContent;
    let start = range.startOffset;
    let end = start;

    while (start > 0 && /\w/.test(text[start - 1])) start--;
    while (end < text.length && /\w/.test(text[end])) end++;

    const word = text.slice(start, end).trim();
    return word.length >= 2 ? word : null;
  }

  // ── Mouse hover ──────────────────────────────────────────────
  let lastMouseX = 0;
  let lastMouseY = 0;
  let mouseStable = false;
  let stableTimer = null;

  document.addEventListener("mousemove", (e) => {
    if (!isEnabled) return;

    const dx = Math.abs(e.clientX - lastMouseX);
    const dy = Math.abs(e.clientY - lastMouseY);
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    clearTimeout(stableTimer);
    mouseStable = false;

    if (dx > 5 || dy > 5) {
      clearTimeout(hoverTimer);
      const word = getWordAtPoint(e.clientX, e.clientY);
      if (word !== lastShownWord && tooltipEl) {
        removeTooltip();
        lastShownWord = "";
      }
    }

    stableTimer = setTimeout(() => {
      mouseStable = true;
      const word = getWordAtPoint(e.clientX, e.clientY);
      if (word && word !== lastShownWord) {
        hoverTimer = setTimeout(() => {
          if (mouseStable) {
            currentWord = word;
            showTooltip(e.pageX, e.pageY, word);
            lastShownWord = word;
          }
        }, 5000);
      }
    }, 100);
  });

  document.addEventListener("mouseleave", () => {
    clearTimeout(hoverTimer);
    clearTimeout(stableTimer);
  });

  document.addEventListener("scroll", () => {}, true);

  // ── Text Selection — instant lookup ──────────────────────────
  document.addEventListener("mouseup", (e) => {
    if (!isEnabled) return;
    if (e.target.closest("#sv-tooltip")) return;

    const selection = window.getSelection();
    if (!selection) return;

    const selected = selection.toString().trim();

    if (selected.length < 2 || selected.length > 40 || /\s/.test(selected)) return;
    if (!/^[a-zA-Z\-']+$/.test(selected)) return;

    clearTimeout(hoverTimer);
    clearTimeout(stableTimer);

    currentWord = selected;
    lastShownWord = "";

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const x = rect.right + window.scrollX;
    const y = rect.bottom + window.scrollY;

    showTooltip(x, y, selected);
    lastShownWord = selected;
  });

})(); // end IIFE