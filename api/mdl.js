// Vercel serverless function — proxies MyDramaList unofficial scraper
// Source: https://github.com/B1PL0B/MyDramaList-Unofficial-API
// This gives us real MDL data for K-dramas, C-dramas, J-dramas etc.

const MDL_BASE = "https://kuryana.vercel.app"; // Kuryana MDL scraper

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: "Missing path" });

  try {
    const url = `${MDL_BASE}${path}`;
    const response = await fetch(url, {
      headers: { "Accept": "application/json", "User-Agent": "AniTrack/1.0" },
    });

    if (!response.ok) return res.status(response.status).json({ error: "MDL API error" });

    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch from MDL", message: error.message });
  }
}
