// Vercel serverless function — proxies MyAnimeList Official API
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: "Missing path" });

  const clientId = process.env.MAL_CLIENT_ID || "7d0f489591f893d15777e985d88f98e6";

  try {
    const url = `https://api.myanimelist.net/v2${path}`;
    const response = await fetch(url, {
      headers: {
        "X-MAL-CLIENT-ID": clientId,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "MAL API error", status: response.status });
    }

    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
