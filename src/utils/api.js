const OMDB_KEY = "68efe870";
const JIKAN_BASE = "https://api.jikan.moe/v4";
const OMDB = "https://www.omdbapi.com";

async function jikanFetch(path, page = 1) {
  try {
    const separator = path.includes("?") ? "&" : "?";
    const url = `/api/jikan?path=${encodeURIComponent(path + separator + "page=" + page)}`;
    const res = await fetch(url);
    if (res.ok) { const json = await res.json(); if (json.data) return json.data; }
  } catch (e) { console.error("Jikan error:", e); }
  return [];
}

function fromJikanAnime(item, type) {
  const offset = { Donghua: 500000 };
  return {
    id: item.mal_id + (offset[type] || 0), malId: item.mal_id,
    title: item.title_english || item.title, type: type || "Anime",
    score: item.score || 0, episodes: item.episodes || 0,
    year: item.year || item.aired?.prop?.from?.year || null,
    img: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || "",
    genres: item.genres?.map(g => g.name) || [],
    streamLinks: getAnimeLinks(item.title_english || item.title, type),
  };
}

function fromJikanManga(item, type) {
  const offsets = { Manhwa:100000, Manhua:200000, "Light Novel":300000, "Web Novel":400000 };
  return {
    id: item.mal_id + (offsets[type] || 0), malId: item.mal_id,
    title: item.title_english || item.title, type: type || "Manga",
    score: item.score || 0, episodes: item.chapters || 0,
    year: item.published?.prop?.from?.year || null,
    img: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || "",
    genres: item.genres?.map(g => g.name) || [],
    streamLinks: getReadLinks(item.title_english || item.title, type),
  };
}

function fromOmdb(item, type) {
  const poster = item.Poster && item.Poster !== "N/A" && item.Poster.startsWith("http") ? item.Poster : "";
  return {
    id: parseInt(item.imdbID?.replace("tt","") || Math.random()*999999),
    imdbId: item.imdbID, title: item.Title, type,
    score: item.imdbRating && item.imdbRating !== "N/A" ? parseFloat(item.imdbRating) : 0,
    episodes: item.totalSeasons ? parseInt(item.totalSeasons)*10 : 1,
    year: item.Year ? parseInt(item.Year) : null, img: poster,
    genres: item.Genre ? item.Genre.split(", ") : [],
    streamLinks: getDramaLinks(item.Title, type),
  };
}

function getAnimeLinks(title, type) {
  const q = encodeURIComponent(title||"");
  if (type === "Donghua") return [
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
  if (["Light Novel","Web Novel"].includes(type)) return [
    {name:"NovelUpdates",url:`https://www.novelupdates.com/?s=${q}`,icon:"📖"},
    {name:"Royal Road",url:`https://www.royalroad.com/fictions/search?title=${q}`,icon:"👑"},
    {name:"Webnovel",url:`https://www.webnovel.com/search?keywords=${q}`,icon:"✍️"},
  ];
  return [
    {name:"MangaDex",url:`https://mangadex.org/search?q=${q}`,icon:"🟠"},
    {name:"MangaPlus",url:`https://mangaplus.shueisha.co.jp/search_result?keyword=${q}`,icon:"🔴"},
    {name:"ComicK",url:`https://comick.io/search?q=${q}`,icon:"🟣"},
  ];
}

function getDramaLinks(title, type) {
  const q = encodeURIComponent(title||"");
  const base = [
    {name:"Netflix",url:`https://www.netflix.com/search?q=${q}`,icon:"🔴"},
    {name:"Prime Video",url:`https://www.amazon.com/s?k=${q}&i=instant-video`,icon:"🔵"},
    {name:"Disney+",url:`https://www.disneyplus.com/search/${q}`,icon:"🔷"},
  ];
  if (type==="K-Drama") return [{name:"Viki",url:`https://www.viki.com/search?q=${q}`,icon:"🟡"},{name:"Kocowa",url:`https://www.kocowa.com/search?q=${q}`,icon:"🟤"},...base];
  if (type==="C-Drama") return [{name:"WeTV",url:`https://wetv.vip/en/search?query=${q}`,icon:"🟩"},{name:"iQIYI",url:`https://www.iq.com/search?query=${q}`,icon:"🟢"},...base];
  if (type==="J-Drama") return [{name:"Viki",url:`https://www.viki.com/search?q=${q}`,icon:"🟡"},...base];
  if (type==="Thai Drama") return [{name:"Viki",url:`https://www.viki.com/search?q=${q}`,icon:"🟡"},{name:"WeTV",url:`https://wetv.vip/en/search?query=${q}`,icon:"🟩"},...base];
  return base;
}

async function searchAnime(q,page=1) { return (await jikanFetch(q.trim()?`/anime?q=${encodeURIComponent(q)}&limit=24&sfw=true`:`/top/anime?limit=24`,page)).map(x=>fromJikanAnime(x,"Anime")); }
async function searchManga(q,page=1) { return (await jikanFetch(q.trim()?`/manga?q=${encodeURIComponent(q)}&limit=24&type=manga`:`/top/manga?limit=24&type=manga`,page)).filter(x=>!x.type||x.type==="Manga").map(x=>fromJikanManga(x,"Manga")); }
async function searchManhwa(q,page=1) { return (await jikanFetch(q.trim()?`/manga?q=${encodeURIComponent(q)}&limit=24&type=manhwa`:`/top/manga?limit=24&type=manhwa`,page)).map(x=>fromJikanManga(x,"Manhwa")); }
async function searchManhua(q,page=1) { return (await jikanFetch(q.trim()?`/manga?q=${encodeURIComponent(q)}&limit=24&type=manhua`:`/top/manga?limit=24&type=manhua`,page)).map(x=>fromJikanManga(x,"Manhua")); }
async function searchDonghua(q) { return (await jikanFetch(`/anime?q=${encodeURIComponent(q.trim()||"chinese")}&limit=24&sfw=true`)).map(x=>fromJikanAnime(x,"Donghua")); }
async function searchLightNovel(q,page=1) { return (await jikanFetch(q.trim()?`/manga?q=${encodeURIComponent(q)}&limit=24&type=lightnovel`:`/top/manga?limit=24&type=lightnovel`,page)).map(x=>fromJikanManga(x,"Light Novel")); }
async function searchWebNovel(q,page=1) { return (await jikanFetch(q.trim()?`/manga?q=${encodeURIComponent(q)}&limit=24&type=novel`:`/top/manga?limit=24&type=novel`,page)).map(x=>fromJikanManga(x,"Web Novel")); }

async function searchDramaOMDB(query, type, defaults, page=1) {
  try {
    if (query.trim()) {
      const [exactRes, searchRes] = await Promise.allSettled([
        fetch(`${OMDB}/?apikey=${OMDB_KEY}&t=${encodeURIComponent(query)}&type=series`).then(r=>r.json()),
        fetch(`${OMDB}/?apikey=${OMDB_KEY}&s=${encodeURIComponent(query)}&type=series`).then(r=>r.json()),
      ]);
      const ids = new Set();
      if (exactRes.status==="fulfilled"&&exactRes.value.Response!=="False") ids.add(exactRes.value.imdbID);
      if (searchRes.status==="fulfilled"&&searchRes.value.Response!=="False") (searchRes.value.Search||[]).forEach(x=>ids.add(x.imdbID));
      if (ids.size>0) {
        const details = await Promise.allSettled([...ids].slice(0,12).map(id=>fetch(`${OMDB}/?apikey=${OMDB_KEY}&i=${id}&plot=short`).then(r=>r.json())));
        const results = details.filter(r=>r.status==="fulfilled"&&r.value.Response!=="False"&&r.value.Poster&&r.value.Poster!=="N/A"&&r.value.Poster.startsWith("http")).map(r=>fromOmdb(r.value,type));
        if (results.length>0) return results;
      }
    }
    const BATCH=15, start=(page-1)*BATCH, batch=defaults.slice(start,start+BATCH);
    if (!batch.length) return [];
    const results = await Promise.allSettled(batch.map(t=>fetch(`${OMDB}/?apikey=${OMDB_KEY}&t=${encodeURIComponent(t)}&type=series`).then(r=>r.json())));
    return results.filter(r=>r.status==="fulfilled"&&r.value.Response!=="False"&&r.value.Poster&&r.value.Poster!=="N/A"&&r.value.Poster.startsWith("http")).map(r=>fromOmdb(r.value,type));
  } catch(e) { return []; }
}

async function omdbSearch(query,omdbType,appType,fallback) {
  try {
    const q=query.trim()||fallback;
    const res=await fetch(`${OMDB}/?apikey=${OMDB_KEY}&s=${encodeURIComponent(q)}&type=${omdbType}`);
    const json=await res.json();
    if(json.Response==="False") return [];
    const details=await Promise.allSettled((json.Search||[]).slice(0,10).map(item=>fetch(`${OMDB}/?apikey=${OMDB_KEY}&i=${item.imdbID}&plot=short`).then(r=>r.json())));
    return details.filter(r=>r.status==="fulfilled"&&r.value.Response!=="False"&&r.value.Poster&&r.value.Poster!=="N/A"&&r.value.Poster.startsWith("http")).map(r=>fromOmdb(r.value,appType));
  } catch(e) { return []; }
}

const K_DRAMA_DEFAULTS=["Squid Game","Crash Landing on You","Goblin","Vincenzo","Descendants of the Sun","My Love from the Star","Itaewon Class","Extraordinary Attorney Woo","Twenty Five Twenty One","Hospital Playlist","Reply 1988","Signal","My Mister","Hometown Cha-Cha-Cha","Business Proposal","Queen of Tears","Lovely Runner","Secret Gratitude","When Life Gives You Tangerines","Squid Game Season 2"];
const C_DRAMA_DEFAULTS=["Nirvana in Fire","The Untamed","Story of Yanxi Palace","Love Between Fairy and Devil","Ashes of Love","Word of Honor","The Bad Kids","Go Ahead","Nothing But Thirty","Joy of Life","Hidden Love","You Are My Glory","Till the End of the Moon","The Story of Ming Lan","The Double"];
const J_DRAMA_DEFAULTS=["Hana Yori Dango","Nodame Cantabile","GTO","Liar Game","Mother","Unnatural","MIU404","Good Doctor Japan","Midnight Diner","Legal High","Last Friends","Rich Man Poor Woman","Long Vacation"];
const THAI_DRAMA_DEFAULTS=["2gether The Series","Until We Meet Again","TharnType","Theory of Love","Girl From Nowhere","Bad Buddy","Lovely Writer","Not Me","KinnPorsche","Only Friends","The Eclipse"];

async function searchKDrama(q,page=1) { return searchDramaOMDB(q,"K-Drama",K_DRAMA_DEFAULTS,page); }
async function searchCDrama(q,page=1) { return searchDramaOMDB(q,"C-Drama",C_DRAMA_DEFAULTS,page); }
async function searchJDrama(q,page=1) { return searchDramaOMDB(q,"J-Drama",J_DRAMA_DEFAULTS,page); }
async function searchThaiDrama(q,page=1) { return searchDramaOMDB(q,"Thai Drama",THAI_DRAMA_DEFAULTS,page); }

export async function searchMedia(query,type,page=1) {
  switch(type) {
    case "anime": return searchAnime(query,page);
    case "manga": return searchManga(query,page);
    case "manhwa": return searchManhwa(query,page);
    case "manhua": return searchManhua(query,page);
    case "donghua": return searchDonghua(query);
    case "lightnovel": return searchLightNovel(query,page);
    case "webnovel": return searchWebNovel(query,page);
    case "kdrama": return searchKDrama(query,page);
    case "cdrama": return searchCDrama(query,page);
    case "jdrama": return searchJDrama(query,page);
    case "thaidrama": return searchThaiDrama(query,page);
    case "movie": return omdbSearch(query,"movie","Movie","action");
    case "show": return omdbSearch(query,"series","TV Show","drama");
    default: return [];
  }
}

export function getAllTypes() {
  return [
    {value:"anime",label:"Anime",emoji:"🎌"},
    {value:"manga",label:"Manga",emoji:"📚"},
    {value:"manhwa",label:"Manhwa",emoji:"KR"},
    {value:"manhua",label:"Manhua",emoji:"CN"},
    {value:"donghua",label:"Donghua",emoji:"🐉"},
    {value:"lightnovel",label:"Light Novel",emoji:"📖"},
    {value:"webnovel",label:"Web Novel",emoji:"✍️"},
    {value:"kdrama",label:"K-Drama",emoji:"KR"},
    {value:"cdrama",label:"C-Drama",emoji:"CN"},
    {value:"jdrama",label:"J-Drama",emoji:"JP"},
    {value:"thaidrama",label:"Thai Drama",emoji:"TH"},
    {value:"movie",label:"Movies",emoji:"🎬"},
    {value:"show",label:"TV Shows",emoji:"📺"},
  ];
}
