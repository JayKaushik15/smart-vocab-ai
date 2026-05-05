# Smart Vocab AI - Chrome Extension

**Hover over any word for 5 seconds to get its AI-powered definition and synonyms.**

---

## 📦 Installation

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `smart-vocab-ai` folder
5. The **SV** icon will appear in your Chrome toolbar!

---

## 🔑 Setup (Required)

1. Click the **SV icon** in your Chrome toolbar
2. Get a **free Gemini API key** from: https://aistudio.google.com/app/apikey
3. Paste your API key in the popup and click **Save**
4. Toggle the extension **ON**

---

## 🚀 How to Use

1. Click the **SV icon** and toggle it **ON** for the current page
2. Move your cursor over any word in an article, document, or PDF
3. **Keep your cursor still for 5 seconds**
4. A beautiful popup will appear with:
   - 📖 **Definition** — clear, concise meaning
   - 🏷️ **Synonyms** — related words as clickable tags
5. Click **✕** to dismiss the popup
6. Move to a new word — the popup won't appear again for the same word until you move away

---

## 📄 Works On

- ✅ News articles & blogs
- ✅ Online research papers
- ✅ Wikipedia & documentation
- ✅ Any webpage with text

---

## 🔒 Privacy

- Your API key is stored locally in Chrome storage only
- Words are sent to Google's Gemini API for processing
- No data is stored or logged by the extension

---

## 🛠️ Tech Stack

- **Manifest V3** Chrome Extension
- **Google Gemini 1.5 Flash** (free tier: 1500 req/day)
- Vanilla JS · CSS animations · Chrome Storage API
