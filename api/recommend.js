// Vercel serverless function — proxies Anthropic API for AI recommendations
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: "Missing query" });

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

    const data = await response.json();
    const text = data.content?.[0]?.text || "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const suggestions = JSON.parse(clean);
    return res.status(200).json({ suggestions });
  } catch (error) {
    return res.status(500).json({ error: "AI failed", message: error.message });
  }
}
