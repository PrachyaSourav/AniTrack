import React, { useState, useEffect } from "react";
import AddEditModal from "../components/AddEditModal";
import {
  getTrendingAnime, getTopRatedAnime, getCurrentlyAiring, getUpcomingAnime,
  getTrendingManga, getTopRatedManga,
  getTrendingManhwa, getTopRatedManhwa,
  getTrendingManhua, getTopRatedManhua,
  getTrendingLightNovels, getTopRatedLightNovels,
  getTrendingWebNovels,
  getTrendingMovies, getTrendingShows,
  getWeeklySchedule, getCurrentSeason, DAYS_ORDER,
} from "../utils/trendingApi";
import { useList } from "../context/ListContext";

// ─── Media Card ───────────────────────────────────────────────
function MediaCard({ item, onAdd }) {
  const { getItem } = useList();
  const [imgErr, setImgErr] = useState(false);
  const existing = getItem(item.id);
  const statusColors = {
    Watching: "text-blue-400", Completed: "text-accent",
    Dropped: "text-red-400", "Plan to Watch": "text-yellow-400", "On Hold": "text-purple-400",
  };
  return (
    <div className="media-card group cursor-pointer flex flex-col" onClick={() => onAdd(item)}>
      <div className="relative aspect-[2/3] overflow-hidden bg-surface-3">
        {!imgErr && item.img ? (
          <img src={item.img} alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-white/10">
            {item.type === "Movie" ? "🎬" : item.type === "TV Show" ? "📺" :
             ["Manga","Manhwa","Manhua"].includes(item.type) ? "📚" :
             ["Light Novel","Web Novel"].includes(item.type) ? "📖" : "🎌"}
          </div>
        )}
        {item.score > 0 && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-md">★ {item.score}</div>
        )}
        {item.rank && (
          <div className="absolute top-2 right-2 bg-accent/80 text-surface text-xs font-bold px-2 py-0.5 rounded-md">#{item.rank}</div>
        )}
        {existing && (
          <div className={`absolute bottom-2 left-2 text-xs font-medium px-2 py-0.5 rounded-md bg-black/70 ${statusColors[existing.status] || "text-white/60"}`}>
            {existing.status === "Plan to Watch" ? "Planned" : existing.status}
          </div>
        )}
        <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="bg-accent text-surface text-xs font-bold px-3 py-1.5 rounded-full">{existing ? "Edit" : "+ Add"}</div>
        </div>
      </div>
      <div className="p-2.5 flex-1 flex flex-col">
        <p className="text-xs font-medium text-white/90 leading-tight line-clamp-2">{item.title}</p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="badge badge-type text-[10px]">{item.type}</span>
          {item.episodes > 0 && <span className="text-[10px] text-white/25">{item.episodes} {["Manga","Manhwa","Manhua","Light Novel","Web Novel"].includes(item.type) ? "ch" : "ep"}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Schedule Item ────────────────────────────────────────────
function ScheduleItem({ item, onAdd }) {
  const [imgErr, setImgErr] = useState(false);
  const { getItem } = useList();
  const existing = getItem(item.id);
  const getLocalTime = () => {
    if (!item.broadcast?.time) return null;
    try {
      const [h, m] = item.broadcast.time.split(":").map(Number);
      const jst = new Date();
      jst.setUTCHours(h - 9, m, 0);
      return jst.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
    } catch { return null; }
  };
  return (
    <div className="flex items-center gap-3 p-3 bg-surface-2 border border-border rounded-xl hover:border-border-hover cursor-pointer transition-all duration-150 group" onClick={() => onAdd(item)}>
      <div className="w-10 h-14 rounded-lg overflow-hidden bg-surface-3 flex-shrink-0">
        {!imgErr && item.img ? (
          <img src={item.img} alt={item.title} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">🎌</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 truncate group-hover:text-white">{item.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.score > 0 && <span className="text-xs text-yellow-400">★ {item.score}</span>}
          {getLocalTime() && <span className="text-xs text-accent/70">🕐 {getLocalTime()}</span>}
          {existing && <span className="text-xs text-white/30">{existing.status}</span>}
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 text-xs text-accent">+</div>
    </div>
  );
}

// ─── Grid section ─────────────────────────────────────────────
function Grid({ items, loading, onAdd }) {
  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
      {[...Array(6)].map((_, i) => (
        <div key={i}><div className="skeleton aspect-[2/3] rounded-xl mb-2" /><div className="skeleton h-2.5 w-3/4 rounded mb-1" /><div className="skeleton h-2.5 w-1/2 rounded" /></div>
      ))}
    </div>
  );
  if (!items?.length) return <p className="text-white/30 text-sm py-8 text-center">No results found.</p>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
      {items.map((item) => <MediaCard key={`${item.type}-${item.id}`} item={item} onAdd={onAdd} />)}
    </div>
  );
}

// ─── Content type tabs ────────────────────────────────────────
const CONTENT_TABS = [
  { key: "anime",     label: "Anime",       emoji: "🎌" },
  { key: "manga",     label: "Manga",       emoji: "📚" },
  { key: "manhwa",    label: "Manhwa",      emoji: "🇰🇷" },
  { key: "manhua",    label: "Manhua",      emoji: "🇨🇳" },
  { key: "lightnovel",label: "Light Novel", emoji: "📖" },
  { key: "webnovel",  label: "Web Novel",   emoji: "✍️" },
  { key: "movie",     label: "Movies",      emoji: "🎬" },
  { key: "show",      label: "TV Shows",    emoji: "📺" },
];

const VIEW_TABS = ["Trending", "Top Rated", "Airing Now", "Upcoming", "Schedule"];

export default function TrendingPage() {
  const [view, setView] = useState("Trending");
  const [contentType, setContentType] = useState("anime");
  const [modalItem, setModalItem] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [scheduleDay, setScheduleDay] = useState(
    new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
  );
  const { season, year } = getCurrentSeason();
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }));
  const setD = (key, val) => setData((p) => ({ ...p, [key]: val }));

  useEffect(() => {
    // Load anime data on mount
    const load = async () => {
      setLoad("anime_trending", true); setLoad("anime_toprated", true);
      setLoad("airing", true); setLoad("upcoming", true); setLoad("schedule", true);
      getTrendingAnime().then((d) => { setD("anime_trending", d); setLoad("anime_trending", false); });
      getTopRatedAnime().then((d) => { setD("anime_toprated", d); setLoad("anime_toprated", false); });
      getCurrentlyAiring().then((d) => { setD("airing", d); setLoad("airing", false); });
      getUpcomingAnime().then((d) => { setD("upcoming", d); setLoad("upcoming", false); });
      getWeeklySchedule().then((d) => { setD("schedule", d); setLoad("schedule", false); });
    };
    load();
  }, []);

  // Lazy load other content types when selected
  useEffect(() => {
    const loaders = {
      manga:      [["manga_trending", getTrendingManga], ["manga_toprated", getTopRatedManga]],
      manhwa:     [["manhwa_trending", getTrendingManhwa], ["manhwa_toprated", getTopRatedManhwa]],
      manhua:     [["manhua_trending", getTrendingManhua], ["manhua_toprated", getTopRatedManhua]],
      lightnovel: [["ln_trending", getTrendingLightNovels], ["ln_toprated", getTopRatedLightNovels]],
      webnovel:   [["wn_trending", getTrendingWebNovels]],
      movie:      [["movie_trending", getTrendingMovies]],
      show:       [["show_trending", getTrendingShows]],
    };
    const pairs = loaders[contentType] || [];
    pairs.forEach(([key, fn]) => {
      if (!data[key]) {
        setLoad(key, true);
        fn().then((d) => { setD(key, d); setLoad(key, false); });
      }
    });
  }, [contentType]);

  const get = (key) => data[key] || [];
  const isLoad = (key) => !!loading[key];

  // Map content type + view to data keys
  const trendingKey = {
    anime: "anime_trending", manga: "manga_trending", manhwa: "manhwa_trending",
    manhua: "manhua_trending", lightnovel: "ln_trending", webnovel: "wn_trending",
    movie: "movie_trending", show: "show_trending",
  }[contentType];

  const topRatedKey = {
    anime: "anime_toprated", manga: "manga_toprated", manhwa: "manhwa_toprated",
    manhua: "manhua_toprated", lightnovel: "ln_toprated",
  }[contentType];

  const showAiringUpcoming = contentType === "anime";
  const showSchedule = contentType === "anime";
  const showTopRated = !!topRatedKey;
  const availableViews = VIEW_TABS.filter((v) => {
    if (v === "Airing Now" && !showAiringUpcoming) return false;
    if (v === "Upcoming" && !showAiringUpcoming) return false;
    if (v === "Schedule" && !showSchedule) return false;
    if (v === "Top Rated" && !showTopRated) return false;
    return true;
  });

  // Reset view if not available for this content type
  useEffect(() => {
    if (!availableViews.includes(view)) setView("Trending");
  }, [contentType]);

  const currentLabel = CONTENT_TABS.find((t) => t.key === contentType)?.label || "";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
          Trending & Upcoming
        </h1>
        <p className="text-white/40 text-sm">{season} {year} · Updated daily from MAL & IMDb</p>
      </div>

      {/* Content type selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {CONTENT_TABS.map((t) => (
          <button key={t.key} onClick={() => setContentType(t.key)}
            className={`chip flex items-center gap-1.5 ${contentType === t.key ? "active" : ""}`}>
            <span>{t.emoji}</span>{t.label}
          </button>
        ))}
      </div>

      {/* View tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {availableViews.map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`chip ${view === v ? "active" : ""}`}>
            {v === "Trending" ? "🔥" : v === "Top Rated" ? "⭐" : v === "Airing Now" ? "📡" : v === "Upcoming" ? "🗓️" : "📅"} {v}
          </button>
        ))}
      </div>

      {/* Trending */}
      {view === "Trending" && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            🔥 Trending {currentLabel}
          </h2>
          <Grid items={get(trendingKey)} loading={isLoad(trendingKey)} onAdd={setModalItem} />
        </div>
      )}

      {/* Top Rated */}
      {view === "Top Rated" && topRatedKey && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            ⭐ Top Rated {currentLabel} of All Time
          </h2>
          <Grid items={get(topRatedKey)} loading={isLoad(topRatedKey)} onAdd={setModalItem} />
        </div>
      )}

      {/* Airing Now */}
      {view === "Airing Now" && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            📡 Currently Airing — {season} {year}
          </h2>
          <Grid items={get("airing")} loading={isLoad("airing")} onAdd={setModalItem} />
        </div>
      )}

      {/* Upcoming */}
      {view === "Upcoming" && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            🗓️ Upcoming Next Season
          </h2>
          <Grid items={get("upcoming")} loading={isLoad("upcoming")} onAdd={setModalItem} />
        </div>
      )}

      {/* Schedule */}
      {view === "Schedule" && (
        <div>
          <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            📅 Weekly Airing Schedule
            <span className="text-sm font-normal text-white/30 ml-2">times in your local timezone</span>
          </h2>
          <div className="flex gap-2 mb-6 flex-wrap">
            {DAYS_ORDER.map((day) => (
              <button key={day} onClick={() => setScheduleDay(day)}
                className={`chip capitalize flex items-center gap-1.5 ${scheduleDay === day ? "active" : ""}`}>
                {day === todayName && <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />}
                {day.slice(0, 3)}
                {day === todayName && <span className="text-[10px] text-accent">Today</span>}
              </button>
            ))}
          </div>
          {isLoad("schedule") ? (
            <div className="flex flex-col gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl">
                  <div className="skeleton w-10 h-14 rounded-lg" />
                  <div className="flex-1"><div className="skeleton h-3 w-1/2 rounded mb-2" /><div className="skeleton h-2.5 w-1/3 rounded" /></div>
                </div>
              ))}
            </div>
          ) : (get("schedule")[scheduleDay] || []).length === 0 ? (
            <div className="text-center py-12 text-white/30"><p className="text-3xl mb-2">📭</p><p className="text-sm">No schedule data for this day.</p></div>
          ) : (
            <div className="flex flex-col gap-3 stagger">
              {(get("schedule")[scheduleDay] || []).map((item) => (
                <ScheduleItem key={item.id} item={item} onAdd={setModalItem} />
              ))}
            </div>
          )}
        </div>
      )}

      {modalItem && <AddEditModal item={modalItem} onClose={() => setModalItem(null)} />}
    </div>
  );
}
