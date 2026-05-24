// Trending, Upcoming & Schedule API
// All powered by Jikan (MyAnimeList) via our Vercel proxy
// OMDB for movies/shows trending

const OMDB_KEY = "68efe870";

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

function normalizeAnime(item, typeOverride) {
  return {
    id: item.mal_id,
    title: item.title_english || item.title,
    img: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || "",
    score: item.score || 0,
    episodes: item.episodes || 0,
    status: item.status || "",
    type: typeOverride || item.type || "Anime",
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

function normalizeManga(item, typeOverride) {
  return {
    id: item.mal_id + (
      typeOverride === "Manhwa" ? 100000 :
      typeOverride === "Manhua" ? 200000 :
      typeOverride === "Light Novel" ? 300000 :
      typeOverride === "Web Novel" ? 400000 : 0
    ),
    malId: item.mal_id,
    title: item.title_english || item.title,
    img: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || "",
    score: item.score || 0,
    chapters: item.chapters || 0,
    episodes: item.chapters || 0,
    status: item.status || "",
    type: typeOverride || item.type || "Manga",
    year: item.published?.prop?.from?.year || null,
    genres: item.genres?.map((g) => g.name) || [],
    synopsis: item.synopsis || "",
    rank: item.rank || null,
    members: item.members || 0,
    url: item.url || "",
  };
}

function normalizeOmdb(item, type) {
  const poster = item.Poster && item.Poster !== "N/A" && item.Poster.startsWith("http") ? item.Poster : "";
  return {
    id: parseInt(item.imdbID?.replace("tt", "") || Math.random() * 999999),
    imdbId: item.imdbID,
    title: item.Title,
    type,
    score: item.imdbRating && item.imdbRating !== "N/A" ? parseFloat(item.imdbRating) : 0,
    episodes: item.totalSeasons ? parseInt(item.totalSeasons) * 10 : 1,
    year: item.Year ? parseInt(item.Year) : null,
    img: poster,
    genres: item.Genre ? item.Genre.split(", ") : [],
    rank: null,
  };
}

// ─── Jikan helpers ────────────────────────────────────────────

async function jikanList(path) {
  const data = await jikanGet(path);
  return data?.data || [];
}

// ─── Anime ────────────────────────────────────────────────────

export async function getTrendingAnime() {
  return (await jikanList("/top/anime?filter=bypopularity&limit=12")).map((x) => normalizeAnime(x, "Anime"));
}

export async function getTopRatedAnime() {
  // Use /top/anime without filter for all-time top rated
  return (await jikanList("/top/anime?limit=12")).map((x) => normalizeAnime(x, "Anime"));
}

export async function getCurrentlyAiring() {
  return (await jikanList("/seasons/now?limit=18")).map((x) => normalizeAnime(x, "Anime"));
}

export async function getUpcomingAnime() {
  return (await jikanList("/seasons/upcoming?limit=18")).map((x) => normalizeAnime(x, "Anime"));
}

// ─── Manga ────────────────────────────────────────────────────

export async function getTrendingManga() {
  return (await jikanList("/top/manga?filter=bypopularity&limit=12&type=manga"))
    .map((x) => normalizeManga(x, "Manga"));
}

export async function getTopRatedManga() {
  return (await jikanList("/top/manga?limit=12&type=manga"))
    .map((x) => normalizeManga(x, "Manga"));
}

// ─── Manhwa ───────────────────────────────────────────────────

export async function getTrendingManhwa() {
  return (await jikanList("/top/manga?filter=bypopularity&limit=12&type=manhwa"))
    .map((x) => normalizeManga(x, "Manhwa"));
}

export async function getTopRatedManhwa() {
  return (await jikanList("/top/manga?limit=12&type=manhwa"))
    .map((x) => normalizeManga(x, "Manhwa"));
}

// ─── Manhua ───────────────────────────────────────────────────

export async function getTrendingManhua() {
  return (await jikanList("/top/manga?filter=bypopularity&limit=12&type=manhua"))
    .map((x) => normalizeManga(x, "Manhua"));
}

export async function getTopRatedManhua() {
  return (await jikanList("/top/manga?limit=12&type=manhua"))
    .map((x) => normalizeManga(x, "Manhua"));
}

// ─── Light Novel ──────────────────────────────────────────────

export async function getTrendingLightNovels() {
  return (await jikanList("/top/manga?filter=bypopularity&limit=12&type=lightnovel"))
    .map((x) => normalizeManga(x, "Light Novel"));
}

export async function getTopRatedLightNovels() {
  return (await jikanList("/top/manga?limit=12&type=lightnovel"))
    .map((x) => normalizeManga(x, "Light Novel"));
}

// ─── Web Novel ────────────────────────────────────────────────

export async function getTrendingWebNovels() {
  return (await jikanList("/top/manga?filter=bypopularity&limit=12&type=novel"))
    .map((x) => normalizeManga(x, "Web Novel"));
}

// ─── Movies (OMDB) ────────────────────────────────────────────

const TOP_MOVIES = ["Inception", "Interstellar", "The Dark Knight", "Parasite", "Everything Everywhere", "Oppenheimer", "The Godfather", "Schindler's List", "Spirited Away", "Your Name"];
const TOP_SHOWS = ["Breaking Bad", "Chernobyl", "Arcane", "The Last of Us", "Game of Thrones", "Sherlock", "Squid Game", "Cyberpunk Edgerunners", "Stranger Things", "The Boys"];

async function omdbFetchDetails(titles, type) {
  const results = await Promise.allSettled(
    titles.map((t) =>
      fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${encodeURIComponent(t)}&type=${type === "Movie" ? "movie" : "series"}`)
        .then((r) => r.json())
    )
  );
  return results
    .filter((r) => r.status === "fulfilled" && r.value.Response !== "False" && r.value.Poster && r.value.Poster !== "N/A")
    .map((r) => normalizeOmdb(r.value, type));
}

export async function getTrendingMovies() {
  return omdbFetchDetails(TOP_MOVIES, "Movie");
}

export async function getTrendingShows() {
  return omdbFetchDetails(TOP_SHOWS, "TV Show");
}

// ─── Weekly Schedule ──────────────────────────────────────────

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export async function getWeeklySchedule() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const priority = [today, DAYS[(DAYS.indexOf(today) + 1) % 7]];
  const rest = DAYS.filter((d) => !priority.includes(d));
  const schedule = {};

  await Promise.all(priority.map(async (day) => {
    const data = await jikanGet(`/schedules?filter=${day}&limit=8`);
    schedule[day] = (data?.data || []).map((x) => normalizeAnime(x, "Anime"));
  }));

  await Promise.all(rest.map(async (day) => {
    const data = await jikanGet(`/schedules?filter=${day}&limit=6`);
    schedule[day] = (data?.data || []).map((x) => normalizeAnime(x, "Anime"));
  }));

  return schedule;
}

// ─── Helpers ──────────────────────────────────────────────────

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
