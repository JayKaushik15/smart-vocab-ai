// Background service worker for Smart Vocab AI

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FETCH_DEFINITION") {
    fetchDefinition(request.word, request.apiKey)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Keep message channel open for async
  }
});

async function fetchDefinition(word, apiKey) {
  const prompt = `Define the word "${word}" concisely. Return a JSON object with exactly these fields:
{
  "definition": "A clear, concise definition in 1-2 sentences.",
  "synonyms": ["synonym1", "synonym2", "synonym3"]
}
Return only valid JSON, no markdown, no extra text.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 200 }
      })
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || "API request failed");
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Clean and parse JSON
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return parsed;
}
