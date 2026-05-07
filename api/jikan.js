// Vercel serverless function — proxies Jikan API
// Your browser calls /api/jikan?path=... → this function calls Jikan → returns data
// This completely bypasses CORS issues since it runs server-side

export default async function handler(req, res) {
  // Allow requests from your app
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ error: "Missing path parameter" });
  }

  try {
    const url = `https://api.jikan.moe/v4${path}`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "AniTrack/1.0",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Jikan API error", status: response.status });
    }

    const data = await response.json();
    
    // Cache for 5 minutes to avoid rate limiting
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch from Jikan", message: error.message });
  }
}
