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

async function jikanList(path, page = 1) {
  const separator = path.includes("?") ? "&" : "?";
  const data = await jikanGet(`${path}${separator}page=${page}`);
  return data?.data || [];
}

// ─── Anime ────────────────────────────────────────────────────

export async function getTrendingAnime(page = 1) {
  return (await jikanList("/top/anime?filter=bypopularity&limit=24", page)).map((x) => normalizeAnime(x, "Anime"));
}

export async function getTopRatedAnime(page = 1) {
  return (await jikanList("/top/anime?limit=24", page)).map((x) => normalizeAnime(x, "Anime"));
}

export async function getCurrentlyAiring(page = 1) {
  return (await jikanList("/seasons/now?limit=24", page)).map((x) => normalizeAnime(x, "Anime"));
}

export async function getUpcomingAnime(page = 1) {
  return (await jikanList("/seasons/upcoming?limit=24", page)).map((x) => normalizeAnime(x, "Anime"));
}

// ─── Manga ────────────────────────────────────────────────────

export async function getTrendingManga(page = 1) {
  return (await jikanList("/top/manga?filter=bypopularity&limit=24&type=manga", page))
    .map((x) => normalizeManga(x, "Manga"));
}

export async function getTopRatedManga(page = 1) {
  return (await jikanList("/top/manga?limit=24&type=manga", page))
    .map((x) => normalizeManga(x, "Manga"));
}

// ─── Manhwa ───────────────────────────────────────────────────

export async function getTrendingManhwa(page = 1) {
  return (await jikanList("/top/manga?filter=bypopularity&limit=24&type=manhwa", page))
    .map((x) => normalizeManga(x, "Manhwa"));
}

export async function getTopRatedManhwa(page = 1) {
  return (await jikanList("/top/manga?limit=24&type=manhwa", page))
    .map((x) => normalizeManga(x, "Manhwa"));
}

// ─── Manhua ───────────────────────────────────────────────────

export async function getTrendingManhua(page = 1) {
  return (await jikanList("/top/manga?filter=bypopularity&limit=24&type=manhua", page))
    .map((x) => normalizeManga(x, "Manhua"));
}

export async function getTopRatedManhua(page = 1) {
  return (await jikanList("/top/manga?limit=24&type=manhua", page))
    .map((x) => normalizeManga(x, "Manhua"));
}

// ─── Light Novel ──────────────────────────────────────────────

export async function getTrendingLightNovels(page = 1) {
  return (await jikanList("/top/manga?filter=bypopularity&limit=24&type=lightnovel", page))
    .map((x) => normalizeManga(x, "Light Novel"));
}

export async function getTopRatedLightNovels(page = 1) {
  return (await jikanList("/top/manga?limit=24&type=lightnovel", page))
    .map((x) => normalizeManga(x, "Light Novel"));
}

// ─── Web Novel ────────────────────────────────────────────────

export async function getTrendingWebNovels(page = 1) {
  return (await jikanList("/top/manga?filter=bypopularity&limit=24&type=novel", page))
    .map((x) => normalizeManga(x, "Web Novel"));
}

// ─── Movies (OMDB) ────────────────────────────────────────────

const TOP_MOVIES = [
  // Hollywood classics & blockbusters
  "Inception", "Interstellar", "The Dark Knight", "Parasite", "Oppenheimer",
  "The Godfather", "Schindler's List", "Pulp Fiction", "Fight Club", "Forrest Gump",
  "The Shawshank Redemption", "Goodfellas", "The Matrix", "Avengers Endgame",
  "Avatar", "Titanic", "Jurassic Park", "The Lion King", "Gladiator", "Braveheart",
  // Animation & anime films
  "Spirited Away", "Your Name", "A Silent Voice", "Demon Slayer Mugen Train",
  "Princess Mononoke", "Akira", "Ghost in the Shell", "The Boy and the Heron",
  // Recent hits
  "Dune", "Top Gun Maverick", "Everything Everywhere All at Once",
  "Spider-Man No Way Home", "Black Panther", "Joker", "1917", "Tenet",
  "The Batman", "John Wick", "Mad Max Fury Road", "Blade Runner 2049",
];

const TOP_SHOWS = [
  // Western hits
  "Breaking Bad", "Chernobyl", "Game of Thrones", "Sherlock",
  "Stranger Things", "The Boys", "Succession", "The Wire",
  "House of Cards", "Better Call Saul", "Peaky Blinders", "Ozark",
  "Dark", "Mindhunter", "Narcos", "Money Heist", "Black Mirror",
  "Westworld", "True Detective", "The Crown",
  // Anime & animation
  "Arcane", "Cyberpunk Edgerunners", "Castlevania",
  // K-Drama & Asian
  "Squid Game", "The Last of Us", "Vincenzo", "Crash Landing on You",
  // Sci-fi & fantasy
  "The Mandalorian", "House of the Dragon", "The Witcher",
  "Andor", "Severance", "Ted Lasso", "Fleabag",
];

async function omdbFetchDetails(titles, type) {
  // Fetch in batches of 10 to avoid rate limiting
  const BATCH = 10;
  const allResults = [];
  for (let i = 0; i < titles.length; i += BATCH) {
    const batch = titles.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map((t) =>
        fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${encodeURIComponent(t)}&type=${type === "Movie" ? "movie" : "series"}`)
          .then((r) => r.json())
      )
    );
    results.forEach((r) => {
      if (r.status === "fulfilled" && r.value.Response !== "False" &&
          r.value.Poster && r.value.Poster !== "N/A" && r.value.Poster.startsWith("http")) {
        allResults.push(normalizeOmdb(r.value, type));
      }
    });
    // Small delay between batches to respect rate limit
    if (i + BATCH < titles.length) await new Promise((r) => setTimeout(r, 300));
  }
  return allResults;
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
