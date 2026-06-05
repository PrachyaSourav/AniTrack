// Vercel serverless function — AI recommendations using Google Gemini API (free tier)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: "Missing query" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not set in Vercel environment variables" });

  // Try multiple models in order — fallback if one fails
  const MODELS = [
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-8b",
  ];

  const prompt = `You are an anime, manga and drama recommendation expert.
The user wants: "${query}"

Suggest exactly 8 titles. Return ONLY a JSON array, no markdown, no explanation, no extra text at all.
Each item must have exactly: title (string), type (one of: Anime, Manga, K-Drama, C-Drama, J-Drama, Thai Drama, Movie, TV Show), reason (one short sentence).

[{"title":"Attack on Titan","type":"Anime","reason":"Epic action with a gripping story"}]`;

  for (const model of MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
          }),
        }
      );

      // Rate limited — try next model
      if (response.status === 429) continue;

      if (!response.ok) {
        const errText = await response.text();
        // Model not found — try next
        if (response.status === 404) continue;
        return res.status(response.status).json({ error: "Gemini error", detail: errText });
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const clean = text.replace(/```json|```/g, "").trim();

      let suggestions;
      try {
        suggestions = JSON.parse(clean);
      } catch {
        const match = clean.match(/\[[\s\S]*\]/);
        suggestions = match ? JSON.parse(match[0]) : [];
      }

      return res.status(200).json({ suggestions, model });
    } catch (e) {
      continue; // Try next model
    }
  }

  // All models failed — return helpful error
  return res.status(429).json({
    error: "All Gemini models are rate limited right now. Please try again in a minute.",
  });
}
