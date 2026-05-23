// Trending, Upcoming & Schedule API
// All powered by Jikan (MyAnimeList) via our Vercel proxy

async function jikanGet(path) {
  try {
    const url = `/api/jikan?path=${encodeURIComponent(path)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Jikan error:", e);
    return null;
  }
}

function normalizeAnime(item) {
  return {
    id: item.mal_id,
    title: item.title_english || item.title,
    img: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || "",
    score: item.score || 0,
    episodes: item.episodes || 0,
    status: item.status || "",
    type: item.type || "TV",
    year: item.year || item.aired?.prop?.from?.year || null,
    genres: item.genres?.map((g) => g.name) || [],
    synopsis: item.synopsis || "",
    rank: item.rank || null,
    members: item.members || 0,
    broadcast: item.broadcast || null,
    airing: item.airing || false,
    url: item.url || "",
  };
}

function normalizeManga(item) {
  return {
    id: item.mal_id + 1000000,
    malId: item.mal_id,
    title: item.title_english || item.title,
    img: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || "",
    score: item.score || 0,
    chapters: item.chapters || 0,
    status: item.status || "",
    type: item.type || "Manga",
    year: item.published?.prop?.from?.year || null,
    genres: item.genres?.map((g) => g.name) || [],
    synopsis: item.synopsis || "",
    rank: item.rank || null,
    members: item.members || 0,
    url: item.url || "",
  };
}

// ─── Trending ─────────────────────────────────────────────────

export async function getTrendingAnime() {
  const data = await jikanGet("/top/anime?filter=bypopularity&limit=12");
  return (data?.data || []).map(normalizeAnime);
}

export async function getTrendingManga() {
  const data = await jikanGet("/top/manga?filter=bypopularity&limit=12");
  return (data?.data || []).map(normalizeManga);
}

export async function getTopRatedAnime() {
  const data = await jikanGet("/top/anime?filter=byScore&limit=12");
  return (data?.data || []).map(normalizeAnime);
}

// ─── Currently Airing ─────────────────────────────────────────

export async function getCurrentlyAiring() {
  const data = await jikanGet("/seasons/now?limit=18");
  return (data?.data || []).map(normalizeAnime);
}

// ─── Upcoming ─────────────────────────────────────────────────

export async function getUpcomingAnime() {
  const data = await jikanGet("/seasons/upcoming?limit=18");
  return (data?.data || []).map(normalizeAnime);
}

// ─── Weekly Schedule ─────────────────────────────────────────
// Returns anime airing on each day of the week

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export async function getWeeklySchedule() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  // Fetch today + tomorrow first for speed, then rest
  const priority = [today, DAYS[(DAYS.indexOf(today) + 1) % 7]];
  const rest = DAYS.filter((d) => !priority.includes(d));

  const schedule = {};

  // Fetch priority days first
  await Promise.all(
    priority.map(async (day) => {
      const data = await jikanGet(`/schedules?filter=${day}&limit=8`);
      schedule[day] = (data?.data || []).map(normalizeAnime);
    })
  );

  // Then fetch rest in background
  await Promise.all(
    rest.map(async (day) => {
      const data = await jikanGet(`/schedules?filter=${day}&limit=6`);
      schedule[day] = (data?.data || []).map(normalizeAnime);
    })
  );

  return schedule;
}

// ─── Current Season Info ──────────────────────────────────────

export function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  let season;
  if (month >= 1 && month <= 3) season = "Winter";
  else if (month >= 4 && month <= 6) season = "Spring";
  else if (month >= 7 && month <= 9) season = "Summer";
  else season = "Fall";
  return { season, year };
}

export const DAYS_ORDER = DAYS;
