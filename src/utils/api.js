// Phase 3+ — Live API search
// Anime/Manga/Manhwa/Manhua/Donghua/Novels: Jikan API (jikan.moe) — free, no key
// Movies/Shows/K-Drama/Anime Films: OMDB API — free key

const OMDB_KEY = "68efe870";
const JIKAN_BASE = "https://api.jikan.moe/v4";
const OMDB = "https://www.omdbapi.com";

// Smart Jikan caller — tries direct first, falls back to proxy
const jikan = (path) => `${JIKAN_BASE}${path}`;

// ─── Normalizers ─────────────────────────────────────────────

function fromJikanAnime(item, typeOverride) {
  return {
    id: item.mal_id + (typeOverride === "Donghua" ? 500000 : 0),
    malId: item.mal_id,
    title: item.title_english || item.title,
    type: typeOverride || "Anime",
    score: item.score || 0,
    episodes: item.episodes || 0,
    year: item.year || item.aired?.prop?.from?.year || null,
    img: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || "",
    genres: item.genres?.map((g) => g.name) || [],
    streamLinks: getAnimeStreamLinks(item.title_english || item.title),
  };
}

function fromJikanManga(item, typeOverride) {
  const offset = { Manhwa: 100000, Manhua: 200000, "Light Novel": 300000, "Web Novel": 400000 };
  return {
    id: item.mal_id + (offset[typeOverride] || 0),
    malId: item.mal_id,
    title: item.title_english || item.title,
    type: typeOverride || "Manga",
    score: item.score || 0,
    episodes: item.chapters || 0,
    year: item.published?.prop?.from?.year || null,
    img: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || "",
    genres: item.genres?.map((g) => g.name) || [],
    streamLinks: getReadLinks(item.title_english || item.title, typeOverride),
  };
}

function fromOmdb(item, type) {
  // Only use poster if it's a real URL (not N/A or missing)
  const poster = item.Poster && item.Poster !== "N/A" && item.Poster.startsWith("http")
    ? item.Poster : "";
  return {
    id: parseInt(item.imdbID?.replace("tt", "") || Math.random() * 999999),
    imdbId: item.imdbID,
    title: item.Title,
    type: type,
    score: item.imdbRating && item.imdbRating !== "N/A" ? parseFloat(item.imdbRating) : 0,
    episodes: item.totalSeasons ? parseInt(item.totalSeasons) * 10 : 1,
    year: item.Year ? parseInt(item.Year) : null,
    img: poster,
    genres: item.Genre ? item.Genre.split(", ") : [],
    country: item.Country || "",
    language: item.Language || "",
    streamLinks: getStreamLinks(item.Title, type),
  };
}

// ─── Stream / Read Link Generators ───────────────────────────

function getAnimeStreamLinks(title) {
  const q = encodeURIComponent(title || "");
  return [
    { name: "Crunchyroll", url: `https://www.crunchyroll.com/search?q=${q}`, icon: "🟠" },
    { name: "Funimation", url: `https://www.funimation.com/search/?q=${q}`, icon: "🟣" },
    { name: "Netflix", url: `https://www.netflix.com/search?q=${q}`, icon: "🔴" },
    { name: "9anime", url: `https://9anime.to/filter?keyword=${q}`, icon: "🔵" },
  ];
}

function getStreamLinks(title, type) {
  const q = encodeURIComponent(title || "");
  const links = [
    { name: "Netflix", url: `https://www.netflix.com/search?q=${q}`, icon: "🔴" },
    { name: "Prime Video", url: `https://www.amazon.com/s?k=${q}&i=instant-video`, icon: "🔵" },
    { name: "Hulu", url: `https://www.hulu.com/search?q=${q}`, icon: "🟢" },
    { name: "Disney+", url: `https://www.disneyplus.com/search/${q}`, icon: "🔷" },
  ];
  if (type === "K-Drama") {
    links.unshift(
      { name: "Viki", url: `https://www.viki.com/search?q=${q}`, icon: "🟡" },
      { name: "Kocowa", url: `https://www.kocowa.com/search?q=${q}`, icon: "🟤" }
    );
  }
  if (type === "Donghua") {
    links.unshift(
      { name: "Bilibili", url: `https://www.bilibili.tv/en/search?keyword=${q}`, icon: "🩵" },
      { name: "WeTV", url: `https://wetv.vip/en/search?query=${q}`, icon: "🟩" }
    );
  }
  return links;
}

function getReadLinks(title, type) {
  const q = encodeURIComponent(title || "");
  if (type === "Light Novel" || type === "Web Novel") {
    return [
      { name: "NovelUpdates", url: `https://www.novelupdates.com/?s=${q}`, icon: "📖" },
      { name: "Royal Road", url: `https://www.royalroad.com/fictions/search?title=${q}`, icon: "👑" },
      { name: "Wuxiaworld", url: `https://www.wuxiaworld.com/search?query=${q}`, icon: "🐉" },
      { name: "Webnovel", url: `https://www.webnovel.com/search?keywords=${q}`, icon: "✍️" },
    ];
  }
  return [
    { name: "MangaDex", url: `https://mangadex.org/search?q=${q}`, icon: "🟠" },
    { name: "MangaPlus", url: `https://mangaplus.shueisha.co.jp/search_result?keyword=${q}`, icon: "🔴" },
    { name: "ComicK", url: `https://comick.io/search?q=${q}`, icon: "🟣" },
  ];
}

// ─── Jikan fetchers ───────────────────────────────────────────

async function jikanFetch(path) {
  const urls = [
    `${JIKAN_BASE}${path}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(JIKAN_BASE + path)}`,
    `https://corsproxy.io/?${encodeURIComponent(JIKAN_BASE + path)}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { "Accept": "application/json" } });
      if (!res.ok) continue;
      const json = await res.json();
      if (json.data) return json.data;
    } catch (e) {
      continue;
    }
  }
  return [];
}

async function searchAnime(query) {
  try {
    const path = query.trim() ? `/anime?q=${encodeURIComponent(query)}&limit=12&sfw=true` : `/top/anime?limit=12`;
    return (await jikanFetch(path)).map((x) => fromJikanAnime(x, "Anime"));
  } catch (e) { console.error(e); return []; }
}

async function searchDonghua(query) {
  try {
    // Donghua = Chinese animation — search anime with Chinese keywords
    const q = query.trim() ? query : "chinese animation";
    const path = `/anime?q=${encodeURIComponent(q)}&limit=12&sfw=true`;
    const data = await jikanFetch(path);
    return data.map((x) => fromJikanAnime(x, "Donghua"));
  } catch (e) { console.error(e); return []; }
}

async function searchManga(query) {
  try {
    const path = query.trim() ? `/manga?q=${encodeURIComponent(query)}&limit=12&type=manga` : `/top/manga?limit=12&type=manga`;
    return (await jikanFetch(path)).map((x) => fromJikanManga(x, "Manga"));
  } catch (e) { console.error(e); return []; }
}

async function searchManhwa(query) {
  try {
    const path = query.trim() ? `/manga?q=${encodeURIComponent(query)}&limit=12&type=manhwa` : `/top/manga?limit=12&type=manhwa`;
    return (await jikanFetch(path)).map((x) => fromJikanManga(x, "Manhwa"));
  } catch (e) { console.error(e); return []; }
}

async function searchManhua(query) {
  try {
    const path = query.trim() ? `/manga?q=${encodeURIComponent(query)}&limit=12&type=manhua` : `/top/manga?limit=12&type=manhua`;
    return (await jikanFetch(path)).map((x) => fromJikanManga(x, "Manhua"));
  } catch (e) { console.error(e); return []; }
}

async function searchLightNovel(query) {
  try {
    const path = query.trim() ? `/manga?q=${encodeURIComponent(query)}&limit=12&type=lightnovel` : `/top/manga?limit=12&type=lightnovel`;
    return (await jikanFetch(path)).map((x) => fromJikanManga(x, "Light Novel"));
  } catch (e) { console.error(e); return []; }
}

async function searchWebNovel(query) {
  try {
    const q = query.trim() || "novel";
    const path = `/manga?q=${encodeURIComponent(q)}&limit=12&type=novel`;
    return (await jikanFetch(path)).map((x) => fromJikanManga(x, "Web Novel"));
  } catch (e) { console.error(e); return []; }
}

// ─── OMDB fetchers ────────────────────────────────────────────

async function omdbSearch(query, omdbType, appType, fallbackQuery) {
  try {
    const q = query.trim() || fallbackQuery;
    const res = await fetch(`${OMDB}/?apikey=${OMDB_KEY}&s=${encodeURIComponent(q)}&type=${omdbType}`);
    const json = await res.json();
    if (json.Response === "False") return [];
    const details = await Promise.allSettled(
      (json.Search || []).slice(0, 10).map((item) =>
        fetch(`${OMDB}/?apikey=${OMDB_KEY}&i=${item.imdbID}&plot=short`).then((r) => r.json())
      )
    );
    return details
      .filter((r) => {
        if (r.status !== "fulfilled") return false;
        const d = r.value;
        return d.Response !== "False" && d.Poster && d.Poster !== "N/A" && d.Poster.startsWith("http");
      })
      .map((r) => fromOmdb(r.value, appType));
  } catch (e) { console.error(e); return []; }
}

async function searchKDrama(query) {
  const DEFAULTS = ["Squid Game", "Crash Landing on You", "Guardian Lonely Great God", "Itaewon Class", "My Love from the Star", "Descendants of the Sun", "Vincenzo"];
  try {
    const searches = query.trim() ? [query] : DEFAULTS;
    const allResults = await Promise.allSettled(
      searches.map((q) =>
        fetch(`${OMDB}/?apikey=${OMDB_KEY}&s=${encodeURIComponent(q)}&type=series`).then((r) => r.json())
      )
    );
    const imdbIds = [];
    allResults.forEach((r) => {
      if (r.status === "fulfilled" && r.value.Response !== "False") {
        (r.value.Search || []).slice(0, query.trim() ? 10 : 3).forEach((x) => {
          if (!imdbIds.includes(x.imdbID)) imdbIds.push(x.imdbID);
        });
      }
    });
    const details = await Promise.allSettled(
      imdbIds.slice(0, 12).map((id) =>
        fetch(`${OMDB}/?apikey=${OMDB_KEY}&i=${id}&plot=short`).then((r) => r.json())
      )
    );
    return details
      .filter((r) => {
        if (r.status !== "fulfilled") return false;
        const d = r.value;
        if (d.Response === "False") return false;
        // When user types a specific query, trust the result (don't over-filter)
        // Only apply Korean filter for default/broad searches
        const hasPoster = d.Poster && d.Poster !== "N/A" && d.Poster.startsWith("http");
        if (!hasPoster) return false;
        if (query.trim()) return true; // user searched specifically — trust OMDB
        const isKorean = d.Country?.includes("South Korea") || d.Language?.includes("Korean");
        return isKorean;
      })
      .map((r) => fromOmdb(r.value, "K-Drama"));
  } catch (e) { console.error(e); return []; }
}

// ─── Main export ──────────────────────────────────────────────

export async function searchMedia(query, type) {
  switch (type) {
    case "anime":       return searchAnime(query);
    case "manga":       return searchManga(query);
    case "manhwa":      return searchManhwa(query);
    case "manhua":      return searchManhua(query);
    case "donghua":     return searchDonghua(query);
    case "lightnovel":  return searchLightNovel(query);
    case "webnovel":    return searchWebNovel(query);
    case "kdrama":      return searchKDrama(query);
    case "movie":       return omdbSearch(query, "movie", "Movie", "action");
    case "show":        return omdbSearch(query, "series", "TV Show", "drama");
    default:            return [];
  }
}

export function getAllTypes() {
  return [
    { value: "anime",      label: "Anime",        emoji: "🎌" },
    { value: "manga",      label: "Manga",        emoji: "📚" },
    { value: "manhwa",     label: "Manhwa",       emoji: "🇰🇷" },
    { value: "manhua",     label: "Manhua",       emoji: "🇨🇳" },
    { value: "donghua",    label: "Donghua",      emoji: "🐉" },
    { value: "lightnovel", label: "Light Novel",  emoji: "📖" },
    { value: "webnovel",   label: "Web Novel",    emoji: "✍️" },
    { value: "kdrama",     label: "K-Drama",      emoji: "🎭" },
    { value: "movie",      label: "Movies",       emoji: "🎬" },
    { value: "show",       label: "TV Shows",     emoji: "📺" },
  ];
}
