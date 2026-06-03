// Vercel serverless function — AI recommendations using Anthropic API
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: "Missing query" });

  // Check API key exists
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ 
      error: "API key not configured",
      debug: "ANTHROPIC_API_KEY environment variable is missing in Vercel settings"
    });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are an anime, manga and drama recommendation expert.
The user wants: "${query}"

Suggest exactly 8 titles. Return ONLY a JSON array, no markdown, no explanation.
Each item: {"title": string, "type": one of [Anime,Manga,K-Drama,C-Drama,J-Drama,Thai Drama,Movie,TV Show], "reason": one short sentence}

Example: [{"title":"Attack on Titan","type":"Anime","reason":"Epic action with deep story"}]`,
        }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ 
        error: "Anthropic API error", 
        status: response.status,
        detail: errText 
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "[]";
    
    // Clean and parse JSON
    const clean = text.replace(/```json|```/g, "").trim();
    let suggestions;
    try {
      suggestions = JSON.parse(clean);
    } catch {
      // Try to extract JSON array from text
      const match = clean.match(/\[[\s\S]*\]/);
      suggestions = match ? JSON.parse(match[0]) : [];
    }

    return res.status(200).json({ suggestions });
  } catch (error) {
    return res.status(500).json({ 
      error: "Server error", 
      message: error.message 
    });
  }
}
