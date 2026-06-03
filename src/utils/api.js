const OMDB_KEY = "68efe870";
const OMDB = "https://www.omdbapi.com";

async function jikanFetch(path) {
  try {
    const url = `/api/jikan?path=${encodeURIComponent(path)}`;
    const res = await fetch(url);
    if (res.ok) { const json = await res.json(); if (json.data) return json.data; }
  } catch (e) { console.error("Jikan proxy error:", e); }
  return [];
}

// ─── MDL (MyDramaList) fetch via our Vercel proxy ────────────
async function mdlFetch(path) {
  try {
    const url = `/api/mdl?path=${encodeURIComponent(path)}`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (e) { console.error("MDL proxy error:", e); }
  return null;
}

function fromMDL(item, typeOverride) {
  return {
    id: 600000 + (item.id || Math.floor(Math.random() * 99999)),
    mdlId: item.id,
    title: item.title || item.name || "",
    type: typeOverride || "K-Drama",
    score: item.rating ? parseFloat(item.rating) : 0,
    episodes: item.episodes || item.eps || 0,
    year: item.year ? parseInt(item.year) : null,
    img: item.image || item.poster || "",
    genres: item.genres || [],
    synopsis: item.synopsis || "",
    country: item.country || "",
    streamLinks: getDramaStreamLinks(item.title || "", typeOverride || "K-Drama"),
  };
}

function getDramaStreamLinks(title, type) {
  const q = encodeURIComponent(title || "");
  const base = [
    { name: "Netflix", url: `https://www.netflix.com/search?q=${q}`, icon: "🔴" },
    { name: "Prime Video", url: `https://www.amazon.com/s?k=${q}&i=instant-video`, icon: "🔵" },
    { name: "Disney+", url: `https://www.disneyplus.com/search/${q}`, icon: "🔷" },
  ];
  if (type === "K-Drama") return [
    { name: "Viki", url: `https://www.viki.com/search?q=${q}`, icon: "🟡" },
    { name: "Kocowa", url: `https://www.kocowa.com/search?q=${q}`, icon: "🟤" },
    ...base,
  ];
  if (type === "C-Drama") return [
    { name: "WeTV", url: `https://wetv.vip/en/search?query=${q}`, icon: "🟩" },
    { name: "iQIYI", url: `https://www.iq.com/search?query=${q}`, icon: "🟢" },
    { name: "Viki", url: `https://www.viki.com/search?q=${q}`, icon: "🟡" },
    ...base,
  ];
  if (type === "J-Drama") return [
    { name: "Viki", url: `https://www.viki.com/search?q=${q}`, icon: "🟡" },
    { name: "Netflix", url: `https://www.netflix.com/search?q=${q}`, icon: "🔴" },
    { name: "Crunchyroll", url: `https://www.crunchyroll.com/search?q=${q}`, icon: "🟠" },
  ];
  if (type === "Thai Drama") return [
    { name: "Netflix", url: `https://www.netflix.com/search?q=${q}`, icon: "🔴" },
    { name: "Viki", url: `https://www.viki.com/search?q=${q}`, icon: "🟡" },
    { name: "WeTV", url: `https://wetv.vip/en/search?query=${q}`, icon: "🟩" },
  ];
  return base;
}

const ID_OFFSET = { Anime:0, Manga:0, Manhwa:100000, Manhua:200000, "Light Novel":300000, "Web Novel":400000, Donghua:500000 };

function fromJikanAnime(item, type) {
  type = type || "Anime";
  return {
    id: item.mal_id + (ID_OFFSET[type]||0), malId: item.mal_id,
    title: item.title_english || item.title, type,
    score: item.score||0, episodes: item.episodes||0,
    year: item.year||item.aired?.prop?.from?.year||null,
    img: item.images?.jpg?.large_image_url||item.images?.jpg?.image_url||"",
    genres: item.genres?.map(g=>g.name)||[],
    status: item.status||"",
    airing: item.airing||false,
    nextEp: item.broadcast?.string||null,
    streamLinks: getAnimeStreamLinks(item.title_english||item.title, type),
  };
}

function fromJikanManga(item, type) {
  return {
    id: item.mal_id+(ID_OFFSET[type]||0), malId: item.mal_id,
    title: item.title_english||item.title, type,
    score: item.score||0, episodes: item.chapters||0,
    year: item.published?.prop?.from?.year||null,
    img: item.images?.jpg?.large_image_url||item.images?.jpg?.image_url||"",
    genres: item.genres?.map(g=>g.name)||[],
    streamLinks: getReadLinks(item.title_english||item.title, type),
  };
}

function fromOmdb(item, type) {
  const poster = item.Poster&&item.Poster!=="N/A"&&item.Poster.startsWith("http")?item.Poster:"";
  return {
    id: parseInt(item.imdbID?.replace("tt","")||Math.random()*999999),
    imdbId: item.imdbID, title: item.Title, type,
    score: item.imdbRating&&item.imdbRating!=="N/A"?parseFloat(item.imdbRating):0,
    episodes: item.totalSeasons?parseInt(item.totalSeasons)*10:1,
    year: item.Year?parseInt(item.Year):null,
    img: poster, genres: item.Genre?item.Genre.split(", "):[],
    country: item.Country||"", language: item.Language||"",
    streamLinks: getStreamLinks(item.Title, type),
  };
}

function getAnimeStreamLinks(title, type) {
  const q = encodeURIComponent(title||"");
  if (type==="Donghua") return [
    {name:"Bilibili",url:`https://www.bilibili.tv/en/search?keyword=${q}`,icon:"🩵"},
    {name:"WeTV",url:`https://wetv.vip/en/search?query=${q}`,icon:"🟩"},
    {name:"Netflix",url:`https://www.netflix.com/search?q=${q}`,icon:"🔴"},
  ];
  return [
    {name:"Crunchyroll",url:`https://www.crunchyroll.com/search?q=${q}`,icon:"🟠"},
    {name:"Funimation",url:`https://www.funimation.com/search/?q=${q}`,icon:"🟣"},
    {name:"Netflix",url:`https://www.netflix.com/search?q=${q}`,icon:"🔴"},
    {name:"9anime",url:`https://9anime.to/filter?keyword=${q}`,icon:"🔵"},
  ];
}

function getReadLinks(title, type) {
  const q = encodeURIComponent(title||"");
  if (type==="Light Novel"||type==="Web Novel") return [
    {name:"NovelUpdates",url:`https://www.novelupdates.com/?s=${q}`,icon:"📖"},
    {name:"Royal Road",url:`https://www.royalroad.com/fictions/search?title=${q}`,icon:"👑"},
    {name:"Wuxiaworld",url:`https://www.wuxiaworld.com/search?query=${q}`,icon:"🐉"},
    {name:"Webnovel",url:`https://www.webnovel.com/search?keywords=${q}`,icon:"✍️"},
  ];
  return [
    {name:"MangaDex",url:`https://mangadex.org/search?q=${q}`,icon:"🟠"},
    {name:"MangaPlus",url:`https://mangaplus.shueisha.co.jp/search_result?keyword=${q}`,icon:"🔴"},
    {name:"ComicK",url:`https://comick.io/search?q=${q}`,icon:"🟣"},
  ];
}

function getStreamLinks(title, type) {
  const q = encodeURIComponent(title||"");
  const base = [
    {name:"Netflix",url:`https://www.netflix.com/search?q=${q}`,icon:"🔴"},
    {name:"Prime Video",url:`https://www.amazon.com/s?k=${q}&i=instant-video`,icon:"🔵"},
    {name:"Hulu",url:`https://www.hulu.com/search?q=${q}`,icon:"🟢"},
    {name:"Disney+",url:`https://www.disneyplus.com/search/${q}`,icon:"🔷"},
  ];
  if (type==="K-Drama") return [{name:"Viki",url:`https://www.viki.com/search?q=${q}`,icon:"🟡"},{name:"Kocowa",url:`https://www.kocowa.com/search?q=${q}`,icon:"🟤"},...base];
  return base;
}

async function searchAnime(q) {
  try { const path=q.trim()?`/anime?q=${encodeURIComponent(q)}&limit=15&sfw=true`:`/top/anime?limit=15`; return (await jikanFetch(path)).map(x=>fromJikanAnime(x,"Anime")); } catch(e){return[];}
}
async function searchDonghua(q) {
  try { return (await jikanFetch(`/anime?q=${encodeURIComponent(q.trim()||"chinese")}&limit=15&sfw=true`)).map(x=>fromJikanAnime(x,"Donghua")); } catch(e){return[];}
}
async function searchManga(q) {
  try { const path=q.trim()?`/manga?q=${encodeURIComponent(q)}&limit=15&type=manga`:`/top/manga?limit=15&type=manga`; return (await jikanFetch(path)).filter(x=>!x.type||x.type==="Manga").map(x=>fromJikanManga(x,"Manga")); } catch(e){return[];}
}
async function searchManhwa(q) {
  try { const path=q.trim()?`/manga?q=${encodeURIComponent(q)}&limit=15&type=manhwa`:`/top/manga?limit=15&type=manhwa`; return (await jikanFetch(path)).filter(x=>!x.type||x.type==="Manhwa").map(x=>fromJikanManga(x,"Manhwa")); } catch(e){return[];}
}
async function searchManhua(q) {
  try { const path=q.trim()?`/manga?q=${encodeURIComponent(q)}&limit=15&type=manhua`:`/top/manga?limit=15&type=manhua`; return (await jikanFetch(path)).filter(x=>!x.type||x.type==="Manhua").map(x=>fromJikanManga(x,"Manhua")); } catch(e){return[];}
}
async function searchLightNovel(q) {
  try { const path=q.trim()?`/manga?q=${encodeURIComponent(q)}&limit=15&type=lightnovel`:`/top/manga?limit=15&type=lightnovel`; return (await jikanFetch(path)).map(x=>fromJikanManga(x,"Light Novel")); } catch(e){return[];}
}
async function searchWebNovel(q) {
  try { const path=q.trim()?`/manga?q=${encodeURIComponent(q)}&limit=15&type=novel`:`/top/manga?limit=15&type=novel`; return (await jikanFetch(path)).map(x=>fromJikanManga(x,"Web Novel")); } catch(e){return[];}
}
async function omdbSearch(q, omdbType, appType, fallback) {
  try {
    const res = await fetch(`${OMDB}/?apikey=${OMDB_KEY}&s=${encodeURIComponent(q.trim()||fallback)}&type=${omdbType}`);
    const json = await res.json();
    if (json.Response==="False") return [];
    const details = await Promise.allSettled((json.Search||[]).slice(0,10).map(item=>fetch(`${OMDB}/?apikey=${OMDB_KEY}&i=${item.imdbID}&plot=short`).then(r=>r.json())));
    return details.filter(r=>r.status==="fulfilled"&&r.value.Response!=="False"&&r.value.Poster&&r.value.Poster!=="N/A"&&r.value.Poster.startsWith("http")).map(r=>fromOmdb(r.value,appType));
  } catch(e){return[];}
}
// ─── Drama search using OMDB with curated defaults ───────────
async function searchDramaOMDB(query, type, defaults, page = 1) {
  try {
    if (query.trim()) {
      // Direct search — try exact title first, then keyword search
      const [exactRes, searchRes] = await Promise.allSettled([
        fetch(`${OMDB}/?apikey=${OMDB_KEY}&t=${encodeURIComponent(query)}&type=series`).then((r) => r.json()),
        fetch(`${OMDB}/?apikey=${OMDB_KEY}&s=${encodeURIComponent(query)}&type=series`).then((r) => r.json()),
      ]);

      const imdbIds = new Set();

      // Add exact match first
      if (exactRes.status === "fulfilled" && exactRes.value.Response !== "False") {
        imdbIds.add(exactRes.value.imdbID);
      }

      // Add search results
      if (searchRes.status === "fulfilled" && searchRes.value.Response !== "False") {
        (searchRes.value.Search || []).forEach((x) => imdbIds.add(x.imdbID));
      }

      if (imdbIds.size > 0) {
        const details = await Promise.allSettled(
          [...imdbIds].slice(0, 12).map((id) =>
            fetch(`${OMDB}/?apikey=${OMDB_KEY}&i=${id}&plot=short`).then((r) => r.json())
          )
        );
        const results = details
          .filter((r) => r.status === "fulfilled" && r.value.Response !== "False" &&
            r.value.Poster && r.value.Poster !== "N/A" && r.value.Poster.startsWith("http"))
          .map((r) => fromOmdb(r.value, type));
        if (results.length > 0) return results;
      }
    }

    // Default — fetch curated list with pagination
    const BATCH = 15;
    const start = (page - 1) * BATCH;
    const batch = defaults.slice(start, start + BATCH);
    if (batch.length === 0) return [];

    const results = await Promise.allSettled(
      batch.map((t) =>
        fetch(`${OMDB}/?apikey=${OMDB_KEY}&t=${encodeURIComponent(t)}&type=series`)
          .then((r) => r.json())
      )
    );
    return results
      .filter((r) => r.status === "fulfilled" && r.value.Response !== "False" &&
        r.value.Poster && r.value.Poster !== "N/A" && r.value.Poster.startsWith("http"))
      .map((r) => fromOmdb(r.value, type));
  } catch (e) { return []; }
}

const K_DRAMA_DEFAULTS = [
  // All time classics
  "Squid Game", "Crash Landing on You", "Goblin", "Vincenzo",
  "Descendants of the Sun", "My Love from the Star", "Itaewon Class",
  "Extraordinary Attorney Woo", "Twenty Five Twenty One", "Hospital Playlist",
  "Reply 1988", "Signal", "My Mister", "Misaeng", "While You Were Sleeping",
  "Hometown Cha-Cha-Cha", "Our Beloved Summer", "Business Proposal",
  "Weightlifting Fairy Kim Bok-joo", "Strong Woman Do Bong Soon",
  "Flower of Evil", "Strangers from Hell", "Kingdom",
  // 2024-2026 recent hits
  "Queen of Tears", "Lovely Runner", "When the Stars Gossip",
  "Squid Game Season 2", "Jeju Island Mjolnir", "When Life Gives You Tangerines",
  "Secret Gratitude", "Dopamine", "Missing Crown Prince",
];

const C_DRAMA_DEFAULTS = [
  "Nirvana in Fire", "The Untamed", "Story of Yanxi Palace",
  "Love Between Fairy and Devil", "Ashes of Love", "Ancient Love Poetry",
  "Word of Honor", "The Bad Kids", "Go Ahead", "Nothing But Thirty",
  "Joy of Life", "Hidden Love", "You Are My Glory", "Till the End of the Moon",
  "Lighter and Princess", "Love You Seven Times", "The Story of Ming Lan",
  "When a Snail Falls in Love", "Longest Promise", "Fox Spirit Matchmaker",
  "The Double", "Blossoms Shanghai", "Queen Dugu",
];

const J_DRAMA_DEFAULTS = [
  "Hana Yori Dango", "Nodame Cantabile", "GTO", "Liar Game",
  "Mother", "Unnatural", "MIU404", "Good Doctor Japan",
  "Midnight Diner", "Legal High", "Last Friends", "Hana Kimi",
  "Rich Man Poor Woman", "First Class", "N no Tame ni",
  "Osen", "Anego", "Long Vacation", "Pride",
];

const THAI_DRAMA_DEFAULTS = [
  "2gether The Series", "Until We Meet Again", "TharnType",
  "He's Coming To Me", "Theory of Love", "Dark Blue Kiss",
  "Girl From Nowhere", "Bad Buddy", "Lovely Writer",
  "Not Me", "KinnPorsche", "My Engineer", "A Tale of Thousand Stars",
  "Check Out", "Vice Versa", "Only Friends", "The Eclipse",
];

async function searchKDrama(query, page = 1) {
  return searchDramaOMDB(query, "K-Drama", K_DRAMA_DEFAULTS, page);
}

async function searchCDrama(query, page = 1) {
  return searchDramaOMDB(query, "C-Drama", C_DRAMA_DEFAULTS, page);
}

async function searchJDrama(query, page = 1) {
  return searchDramaOMDB(query, "J-Drama", J_DRAMA_DEFAULTS, page);
}

async function searchThaiDrama(query, page = 1) {
  return searchDramaOMDB(query, "Thai Drama", THAI_DRAMA_DEFAULTS, page);
}

export async function searchMedia(query, type, page = 1) {
  switch(type) {
    case "anime":      return searchAnime(query);
    case "manga":      return searchManga(query);
    case "manhwa":     return searchManhwa(query);
    case "manhua":     return searchManhua(query);
    case "donghua":    return searchDonghua(query);
    case "lightnovel": return searchLightNovel(query);
    case "webnovel":   return searchWebNovel(query);
    case "kdrama":     return searchKDrama(query, page);
    case "cdrama":     return searchCDrama(query, page);
    case "jdrama":     return searchJDrama(query, page);
    case "thaidrama":  return searchThaiDrama(query, page);
    case "movie":      return omdbSearch(query,"movie","Movie","action");
    case "show":       return omdbSearch(query,"series","TV Show","drama");
    default: return [];
  }
}

export function getAllTypes() {
  return [
    {value:"anime",     label:"Anime",       emoji:"🎌"},
    {value:"manga",     label:"Manga",       emoji:"📚"},
    {value:"manhwa",    label:"Manhwa",      emoji:"KR"},
    {value:"manhua",    label:"Manhua",      emoji:"CN"},
    {value:"donghua",   label:"Donghua",     emoji:"🐉"},
    {value:"lightnovel",label:"Light Novel", emoji:"📖"},
    {value:"webnovel",  label:"Web Novel",   emoji:"✍️"},
    {value:"kdrama",    label:"K-Drama",     emoji:"KR"},
    {value:"cdrama",    label:"C-Drama",     emoji:"CN"},
    {value:"jdrama",    label:"J-Drama",     emoji:"JP"},
    {value:"thaidrama", label:"Thai Drama",  emoji:"TH"},
    {value:"movie",     label:"Movies",      emoji:"🎬"},
    {value:"show",      label:"TV Shows",    emoji:"📺"},
  ];
}

// ─── Trending & Upcoming API functions ───────────────────────

export async function getTrendingAnime() {
  try { return (await jikanFetch("/top/anime?limit=12&filter=airing")).map(x=>fromJikanAnime(x,"Anime")); } catch(e){return[];}
}

export async function getTopAnimeWeek() {
  try { return (await jikanFetch("/top/anime?limit=10&filter=bypopularity")).map(x=>fromJikanAnime(x,"Anime")); } catch(e){return[];}
}

export async function getTopAnimeSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth()+1;
  const season = month<=3?"winter":month<=6?"spring":month<=9?"summer":"fall";
  try { return (await jikanFetch(`/seasons/${year}/${season}?limit=12`)).map(x=>fromJikanAnime(x,"Anime")); } catch(e){return[];}
}

export async function getUpcomingAnime() {
  try { return (await jikanFetch("/seasons/upcoming?limit=12")).map(x=>fromJikanAnime(x,"Anime")); } catch(e){return[];}
}

export async function getAiringToday() {
  // Get currently airing anime — Jikan schedules endpoint
  const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const today = days[new Date().getDay()];
  try { return (await jikanFetch(`/schedules?filter=${today}&limit=12`)).map(x=>fromJikanAnime(x,"Anime")); } catch(e){return[];}
}

export async function getTrendingManga() {
  try { return (await jikanFetch("/top/manga?limit=10&type=manga")).map(x=>fromJikanManga(x,"Manga")); } catch(e){return[];}
}
