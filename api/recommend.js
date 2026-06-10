// Vercel serverless function — AI recommendations using Groq API
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: "Missing query" });

  const apiKey = process.env.GROQ_API_KEY || process.env.groq_api_key;

  if (!apiKey) {
    const envKeys = Object.keys(process.env).filter(k => !k.includes("PATH") && !k.includes("NODE"));
    return res.status(500).json({
      error: "GROQ_API_KEY not found",
      availableEnvKeys: envKeys,
      tip: "Add GROQ_API_KEY in Vercel Settings → Environment Variables then Redeploy"
    });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "You are an anime, manga and drama recommendation expert. Always respond with ONLY a valid JSON array, no markdown, no explanation.",
          },
          {
            role: "user",
            content: `The user wants: "${query}"

Suggest exactly 8 titles. Return ONLY a JSON array.
Each item: {"title": string, "type": one of [Anime,Manga,K-Drama,C-Drama,J-Drama,Thai Drama,Movie,TV Show], "reason": one short sentence}

Example: [{"title":"Your Name","type":"Movie","reason":"Beautiful emotional romance"}]`,
          }
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: "Groq API error", detail: errText });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "[]";
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
