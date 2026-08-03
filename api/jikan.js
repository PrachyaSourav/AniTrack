// Jikan proxy with MAL fallback
const MAL_CLIENT_ID = "7d0f489591f893d15777e985d88f98e6";

// Convert Jikan path to MAL path
function toMALPath(path) {
  if (path.includes("/top/anime")) return "/anime/ranking?ranking_type=bypopularity&limit=24&fields=id,title,main_picture,mean,num_episodes,genres,start_date,status";
  if (path.includes("/top/manga")) return "/manga/ranking?ranking_type=bypopularity&limit=24&fields=id,title,main_picture,mean,num_chapters,genres,start_date,status";
  if (path.includes("/anime?q=")) {
    const q = path.match(/q=([^&]*)/)?.[1] || "";
    return `/anime?q=${q}&limit=24&fields=id,title,main_picture,mean,num_episodes,genres,start_date,status`;
  }
  if (path.includes("/manga?q=")) {
    const q = path.match(/q=([^&]*)/)?.[1] || "";
    return `/manga?q=${q}&limit=24&fields=id,title,main_picture,mean,num_chapters,genres,start_date,status`;
  }
  if (path.includes("/seasons/now")) return "/anime/season/now?limit=24&fields=id,title,main_picture,mean,num_episodes,genres,start_date,status";
  return null;
}

// Normalize MAL response to Jikan format
function fromMALAnime(item) {
  const n = item.node || item;
  return {
    mal_id: n.id,
    title: n.title,
    title_english: n.title,
    images: { jpg: { large_image_url: n.main_picture?.large || n.main_picture?.medium || "" } },
    score: n.mean || 0,
    episodes: n.num_episodes || 0,
    status: n.status || "",
    genres: (n.genres || []).map(g => ({ name: g.name })),
    year: n.start_date ? parseInt(n.start_date.split("-")[0]) : null,
  };
}

function fromMALManga(item) {
  const n = item.node || item;
  return {
    mal_id: n.id,
    title: n.title,
    title_english: n.title,
    images: { jpg: { large_image_url: n.main_picture?.large || n.main_picture?.medium || "" } },
    score: n.mean || 0,
    chapters: n.num_chapters || 0,
    status: n.status || "",
    genres: (n.genres || []).map(g => ({ name: g.name })),
    published: { prop: { from: { year: n.start_date ? parseInt(n.start_date.split("-")[0]) : null } } },
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: "Missing path" });

  // Try Jikan first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`https://api.jikan.moe/v4${path}`, {
      headers: { "Accept": "application/json", "User-Agent": "AniTrack/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
        return res.status(200).json(data);
      }
    }
  } catch (e) {
    console.log("Jikan failed, trying MAL fallback:", e.message);
  }

  // Fallback to MAL official API
  try {
    const malPath = toMALPath(path);
    if (!malPath) return res.status(200).json({ data: [] });

    const malRes = await fetch(`https://api.myanimelist.net/v2${malPath}`, {
      headers: { "X-MAL-CLIENT-ID": MAL_CLIENT_ID, "Accept": "application/json" },
    });

    if (malRes.ok) {
      const malData = await malRes.json();
      const items = malData.data || [];
      const isManga = path.includes("manga");

      // Convert MAL format to Jikan format so our app works without changes
      const converted = items.map(item => isManga ? fromMALManga(item) : fromMALAnime(item));
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
      return res.status(200).json({ data: converted });
    }
  } catch (e) {
    console.log("MAL fallback also failed:", e.message);
  }

  return res.status(200).json({ data: [] });
}
