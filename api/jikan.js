export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { path } = req.query;
  if (!path) return res.status(400).json({ error: "Missing path" });
  try {
    const response = await fetch(`https://api.jikan.moe/v4${path}`, {
      headers: { "Accept": "application/json", "User-Agent": "AniTrack/1.0" },
    });
    if (!response.ok) return res.status(response.status).json({ error: "Jikan API error" });
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch from Jikan" });
  }
}
