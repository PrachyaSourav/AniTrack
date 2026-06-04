// Vercel serverless function — AI recommendations using Google Gemini API
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: "Missing query" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured in Vercel environment variables" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an anime, manga and drama recommendation expert.
The user wants: "${query}"

Suggest exactly 8 titles. Return ONLY a JSON array, no markdown, no explanation, no extra text.
Each item must have exactly these fields: title (string), type (one of: Anime, Manga, K-Drama, C-Drama, J-Drama, Thai Drama, Movie, TV Show), reason (one short sentence why they would like it).

Return format example:
[{"title":"Attack on Titan","type":"Anime","reason":"Epic action with a gripping story"},{"title":"Your Name","type":"Movie","reason":"Beautiful and emotional romance"}]`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: "Gemini API error", detail: errText });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Clean and parse JSON
    const clean = text.replace(/```json|```/g, "").trim();
    let suggestions;
    try {
      suggestions = JSON.parse(clean);
    } catch {
      const match = clean.match(/\[[\s\S]*\]/);
      suggestions = match ? JSON.parse(match[0]) : [];
    }

    return res.status(200).json({ suggestions });
  } catch (error) {
    return res.status(500).json({ error: "Server error", message: error.message });
  }
}
