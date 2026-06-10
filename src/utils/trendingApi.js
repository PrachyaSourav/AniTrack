const OMDB_KEY = "68efe870";
const JIKAN_BASE = "https://api.jikan.moe/v4";
const OMDB = "https://www.omdbapi.com";

async function jikanGet(path) {
  try {
    const res = await fetch(`/api/jikan?path=${encodeURIComponent(path)}`);
    if (res.ok) return await res.json();
  } catch(e) {}
  return null;
}

async function jikanList(path, page=1) {
  const sep = path.includes("?")?"&":"?";
  const data = await jikanGet(`${path}${sep}page=${page}`);
  return data?.data || [];
}

function normalizeAnime(item, type) {
  return { id:item.mal_id, title:item.title_english||item.title, img:item.images?.jpg?.large_image_url||item.images?.jpg?.image_url||"", score:item.score||0, episodes:item.episodes||0, status:item.status||"", type:type||"Anime", year:item.year||item.aired?.prop?.from?.year||null, genres:item.genres?.map(g=>g.name)||[], rank:item.rank||null, broadcast:item.broadcast||null };
}

function normalizeManga(item, type) {
  const offsets={Manhwa:100000,Manhua:200000,"Light Novel":300000,"Web Novel":400000};
  return { id:item.mal_id+(offsets[type]||0), title:item.title_english||item.title, img:item.images?.jpg?.large_image_url||item.images?.jpg?.image_url||"", score:item.score||0, episodes:item.chapters||0, type:type||"Manga", year:item.published?.prop?.from?.year||null, genres:item.genres?.map(g=>g.name)||[], rank:item.rank||null };
}

function normalizeOmdb(item, type) {
  const poster = item.Poster&&item.Poster!=="N/A"&&item.Poster.startsWith("http")?item.Poster:"";
  return { id:parseInt(item.imdbID?.replace("tt","")||Math.random()*999999), title:item.Title, type, score:item.imdbRating&&item.imdbRating!=="N/A"?parseFloat(item.imdbRating):0, episodes:item.totalSeasons?parseInt(item.totalSeasons)*10:1, year:item.Year?parseInt(item.Year):null, img:poster, genres:item.Genre?item.Genre.split(", "):[] };
}

export async function getTrendingAnime(page=1) { return (await jikanList("/top/anime?filter=bypopularity&limit=24",page)).map(x=>normalizeAnime(x,"Anime")); }
export async function getTopRatedAnime(page=1) { return (await jikanList("/top/anime?limit=24",page)).map(x=>normalizeAnime(x,"Anime")); }
export async function getCurrentlyAiring(page=1) { return (await jikanList("/seasons/now?limit=24",page)).map(x=>normalizeAnime(x,"Anime")); }
export async function getUpcomingAnime(page=1) { return (await jikanList("/seasons/upcoming?limit=24",page)).map(x=>normalizeAnime(x,"Anime")); }
export async function getTrendingManga(page=1) { return (await jikanList("/top/manga?filter=bypopularity&limit=24&type=manga",page)).map(x=>normalizeManga(x,"Manga")); }
export async function getTopRatedManga(page=1) { return (await jikanList("/top/manga?limit=24&type=manga",page)).map(x=>normalizeManga(x,"Manga")); }
export async function getTrendingManhwa(page=1) { return (await jikanList("/top/manga?filter=bypopularity&limit=24&type=manhwa",page)).map(x=>normalizeManga(x,"Manhwa")); }
export async function getTopRatedManhwa(page=1) { return (await jikanList("/top/manga?limit=24&type=manhwa",page)).map(x=>normalizeManga(x,"Manhwa")); }
export async function getTrendingManhua(page=1) { return (await jikanList("/top/manga?filter=bypopularity&limit=24&type=manhua",page)).map(x=>normalizeManga(x,"Manhua")); }
export async function getTopRatedManhua(page=1) { return (await jikanList("/top/manga?limit=24&type=manhua",page)).map(x=>normalizeManga(x,"Manhua")); }
export async function getTrendingLightNovels(page=1) { return (await jikanList("/top/manga?filter=bypopularity&limit=24&type=lightnovel",page)).map(x=>normalizeManga(x,"Light Novel")); }
export async function getTopRatedLightNovels(page=1) { return (await jikanList("/top/manga?limit=24&type=lightnovel",page)).map(x=>normalizeManga(x,"Light Novel")); }
export async function getTrendingWebNovels(page=1) { return (await jikanList("/top/manga?filter=bypopularity&limit=24&type=novel",page)).map(x=>normalizeManga(x,"Web Novel")); }

const TOP_MOVIES=["Inception","Interstellar","The Dark Knight","Parasite","Oppenheimer","The Godfather","Pulp Fiction","Fight Club","Forrest Gump","The Shawshank Redemption","Goodfellas","The Matrix","Avengers Endgame","Spirited Away","Your Name","A Silent Voice","Dune","Top Gun Maverick","Spider-Man No Way Home","Joker","1917","The Batman","John Wick","Mad Max Fury Road","Blade Runner 2049","Everything Everywhere All at Once","Princess Mononoke","Akira"];
const TOP_SHOWS=["Breaking Bad","Chernobyl","Game of Thrones","Sherlock","Stranger Things","The Boys","Succession","Better Call Saul","Peaky Blinders","Ozark","Dark","Narcos","Money Heist","Black Mirror","True Detective","Arcane","Cyberpunk Edgerunners","Squid Game","The Last of Us","The Mandalorian","House of the Dragon","The Witcher","Severance","Ted Lasso"];

async function omdbFetchList(titles, type) {
  const results = await Promise.allSettled(titles.map(t=>fetch(`${OMDB}/?apikey=${OMDB_KEY}&t=${encodeURIComponent(t)}&type=${type==="Movie"?"movie":"series"}`).then(r=>r.json())));
  return results.filter(r=>r.status==="fulfilled"&&r.value.Response!=="False"&&r.value.Poster&&r.value.Poster!=="N/A"&&r.value.Poster.startsWith("http")).map(r=>normalizeOmdb(r.value,type));
}

export async function getTrendingMovies() { return omdbFetchList(TOP_MOVIES,"Movie"); }
export async function getTrendingShows() { return omdbFetchList(TOP_SHOWS,"TV Show"); }

const DAYS=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

export async function getWeeklySchedule() {
  const today=new Date().toLocaleDateString("en-US",{weekday:"long"}).toLowerCase();
  const priority=[today,DAYS[(DAYS.indexOf(today)+1)%7]];
  const rest=DAYS.filter(d=>!priority.includes(d));
  const schedule={};
  await Promise.all(priority.map(async day=>{const data=await jikanGet(`/schedules?filter=${day}&limit=8`);schedule[day]=(data?.data||[]).map(x=>normalizeAnime(x,"Anime"));}));
  await Promise.all(rest.map(async day=>{const data=await jikanGet(`/schedules?filter=${day}&limit=6`);schedule[day]=(data?.data||[]).map(x=>normalizeAnime(x,"Anime"));}));
  return schedule;
}

export function getCurrentSeason() {
  const month=new Date().getMonth()+1, year=new Date().getFullYear();
  const season=month<=3?"Winter":month<=6?"Spring":month<=9?"Summer":"Fall";
  return {season,year};
}

export const DAYS_ORDER=DAYS;
