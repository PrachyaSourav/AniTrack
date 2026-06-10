import React, { useState, useEffect } from "react";
import AddEditModal from "../components/AddEditModal";
import { getTrendingAnime, getTopRatedAnime, getCurrentlyAiring, getUpcomingAnime, getTrendingManga, getTopRatedManga, getTrendingManhwa, getTopRatedManhwa, getTrendingManhua, getTopRatedManhua, getTrendingLightNovels, getTopRatedLightNovels, getTrendingWebNovels, getTrendingMovies, getTrendingShows, getWeeklySchedule, getCurrentSeason, DAYS_ORDER } from "../utils/trendingApi";
import { useList } from "../context/ListContext";

function MediaCard({ item, onAdd }) {
  const { getItem } = useList();
  const [imgErr, setImgErr] = useState(false);
  const existing = getItem(item.id);
  return (
    <div className="media-card group cursor-pointer flex flex-col" onClick={() => onAdd(item)}>
      <div className="relative aspect-[2/3] overflow-hidden" style={{ background: "var(--bg3)" }}>
        {!imgErr && item.img ? <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={() => setImgErr(true)} /> :
          <div className="w-full h-full flex items-center justify-center text-3xl" style={{ color: "var(--text3)" }}>🎌</div>}
        {item.score > 0 && <div className="absolute top-2 left-2 bg-black/70 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-md">★ {item.score}</div>}
        {item.rank && <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: "var(--accent)", color: "var(--bg)" }}>#{item.rank}</div>}
        {existing && <div className="absolute bottom-2 left-2 text-xs font-medium px-2 py-0.5 rounded-md bg-black/70 text-accent">{existing.status === "Plan to Watch" ? "Planned" : existing.status}</div>}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
          <div className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "var(--accent)", color: "var(--bg)" }}>{existing ? "Edit" : "+ Add"}</div>
        </div>
      </div>
      <div className="p-2.5 flex-1 flex flex-col">
        <p className="text-xs font-medium leading-tight line-clamp-2" style={{ color: "var(--text)" }}>{item.title}</p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="badge badge-type text-[10px]">{item.type}</span>
          {item.episodes > 0 && <span className="text-[10px]" style={{ color: "var(--text3)" }}>{item.episodes} ep</span>}
        </div>
      </div>
    </div>
  );
}

function ScheduleItem({ item, onAdd }) {
  const [imgErr, setImgErr] = useState(false);
  const getLocalTime = () => {
    if (!item.broadcast?.time) return null;
    try {
      const [h, m] = item.broadcast.time.split(":").map(Number);
      const jst = new Date(); jst.setUTCHours(h - 9, m, 0);
      return jst.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
    } catch { return null; }
  };
  return (
    <div className="flex items-center gap-3 p-3 border rounded-xl hover:border-accent/30 cursor-pointer transition-all duration-150 group" style={{ background: "var(--bg2)", borderColor: "var(--border)" }} onClick={() => onAdd(item)}>
      <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--bg3)" }}>
        {!imgErr && item.img ? <img src={item.img} alt={item.title} className="w-full h-full object-cover" onError={() => setImgErr(true)} /> :
          <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text3)" }}>🎌</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{item.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.score > 0 && <span className="text-xs text-yellow-400">★ {item.score}</span>}
          {getLocalTime() && <span className="text-xs" style={{ color: "var(--accent)" }}>🕐 {getLocalTime()}</span>}
        </div>
      </div>
    </div>
  );
}

function Grid({ items, loading, onAdd, onLoadMore, loadingMore }) {
  if (loading) return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">{[...Array(12)].map((_, i) => <div key={i}><div className="skeleton aspect-[2/3] rounded-xl mb-2" /><div className="skeleton h-2.5 w-3/4 rounded mb-1" /></div>)}</div>;
  if (!items?.length) return <p className="text-sm py-8 text-center" style={{ color: "var(--text3)" }}>No results found.</p>;
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
        {items.map((item) => <MediaCard key={`${item.type}-${item.id}`} item={item} onAdd={onAdd} />)}
      </div>
      {onLoadMore && (
        <div className="flex justify-center mt-8">
          <button onClick={onLoadMore} disabled={loadingMore} className="btn-ghost flex items-center gap-2 disabled:opacity-50">
            {loadingMore ? <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Loading...</> : "Load more →"}
          </button>
        </div>
      )}
    </div>
  );
}

const CONTENT_TABS = [
  { key: "anime", label: "Anime", emoji: "🎌" },
  { key: "manga", label: "Manga", emoji: "📚" },
  { key: "manhwa", label: "Manhwa", emoji: "KR" },
  { key: "manhua", label: "Manhua", emoji: "CN" },
  { key: "lightnovel", label: "Light Novel", emoji: "📖" },
  { key: "webnovel", label: "Web Novel", emoji: "✍️" },
  { key: "movie", label: "Movies", emoji: "🎬" },
  { key: "show", label: "TV Shows", emoji: "📺" },
];
const VIEW_TABS = ["Trending", "Top Rated", "Airing Now", "Upcoming", "Schedule"];

export default function TrendingPage() {
  const [view, setView] = useState("Trending");
  const [contentType, setContentType] = useState("anime");
  const [modalItem, setModalItem] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [pages, setPages] = useState({});
  const [loadingMore, setLoadingMore] = useState({});
  const [scheduleDay, setScheduleDay] = useState(new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase());
  const { season, year } = getCurrentSeason();
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  const setLoad = (k, v) => setLoading((p) => ({ ...p, [k]: v }));
  const setD = (k, v) => setData((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    setLoad("anime_trending", true); setLoad("anime_toprated", true);
    setLoad("airing", true); setLoad("upcoming", true); setLoad("schedule", true);
    getTrendingAnime().then((d) => { setD("anime_trending", d); setLoad("anime_trending", false); });
    getTopRatedAnime().then((d) => { setD("anime_toprated", d); setLoad("anime_toprated", false); });
    getCurrentlyAiring().then((d) => { setD("airing", d); setLoad("airing", false); });
    getUpcomingAnime().then((d) => { setD("upcoming", d); setLoad("upcoming", false); });
    getWeeklySchedule().then((d) => { setD("schedule", d); setLoad("schedule", false); });
  }, []);

  useEffect(() => {
    const loaders = {
      manga: [["manga_trending", getTrendingManga], ["manga_toprated", getTopRatedManga]],
      manhwa: [["manhwa_trending", getTrendingManhwa], ["manhwa_toprated", getTopRatedManhwa]],
      manhua: [["manhua_trending", getTrendingManhua], ["manhua_toprated", getTopRatedManhua]],
      lightnovel: [["ln_trending", getTrendingLightNovels], ["ln_toprated", getTopRatedLightNovels]],
      webnovel: [["wn_trending", getTrendingWebNovels]],
      movie: [["movie_trending", getTrendingMovies]],
      show: [["show_trending", getTrendingShows]],
    };
    (loaders[contentType] || []).forEach(([key, fn]) => {
      if (!data[key]) { setLoad(key, true); fn().then((d) => { setD(key, d); setLoad(key, false); }); }
    });
  }, [contentType]);

  const get = (k) => data[k] || [];
  const isLoad = (k) => !!loading[k];

  const trendingKey = { anime: "anime_trending", manga: "manga_trending", manhwa: "manhwa_trending", manhua: "manhua_trending", lightnovel: "ln_trending", webnovel: "wn_trending", movie: "movie_trending", show: "show_trending" }[contentType];
  const topRatedKey = { anime: "anime_toprated", manga: "manga_toprated", manhwa: "manhwa_toprated", manhua: "manhua_toprated", lightnovel: "ln_toprated" }[contentType];

  const availableViews = VIEW_TABS.filter((v) => {
    if ((v === "Airing Now" || v === "Upcoming" || v === "Schedule") && contentType !== "anime") return false;
    if (v === "Top Rated" && !topRatedKey) return false;
    return true;
  });

  useEffect(() => { if (!availableViews.includes(view)) setView("Trending"); }, [contentType]);

  const handleLoadMore = async (dataKey, fetchFn) => {
    const nextPage = (pages[dataKey] || 1) + 1;
    setLoadingMore((p) => ({ ...p, [dataKey]: true }));
    try {
      const more = await fetchFn(nextPage);
      if (more.length > 0) { setD(dataKey, [...(data[dataKey] || []), ...more]); setPages((p) => ({ ...p, [dataKey]: nextPage })); }
    } catch (e) {}
    setLoadingMore((p) => ({ ...p, [dataKey]: false }));
  };

  const loadMoreFns = {
    anime: { trending: ["anime_trending", (p) => getTrendingAnime(p)], toprated: ["anime_toprated", (p) => getTopRatedAnime(p)] },
    manga: { trending: ["manga_trending", (p) => getTrendingManga(p)], toprated: ["manga_toprated", (p) => getTopRatedManga(p)] },
    manhwa: { trending: ["manhwa_trending", (p) => getTrendingManhwa(p)], toprated: ["manhwa_toprated", (p) => getTopRatedManhwa(p)] },
    manhua: { trending: ["manhua_trending", (p) => getTrendingManhua(p)], toprated: ["manhua_toprated", (p) => getTopRatedManhua(p)] },
    lightnovel: { trending: ["ln_trending", (p) => getTrendingLightNovels(p)], toprated: ["ln_toprated", (p) => getTopRatedLightNovels(p)] },
    webnovel: { trending: ["wn_trending", (p) => getTrendingWebNovels(p)] },
  };

  const getLoadMore = (viewType) => {
    const fns = loadMoreFns[contentType];
    if (!fns) return null;
    const pair = viewType === "Trending" ? fns.trending : fns.toprated;
    if (!pair) return null;
    const [key, fn] = pair;
    return { onLoadMore: () => handleLoadMore(key, fn), loadingMore: !!loadingMore[key] };
  };

  const currentLabel = CONTENT_TABS.find((t) => t.key === contentType)?.label || "";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "'Syne', sans-serif" }}>Trending & Upcoming</h1>
        <p className="text-sm" style={{ color: "var(--text3)" }}>{season} {year} · Updated daily from MAL & IMDb</p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {CONTENT_TABS.map((t) => (
          <button key={t.key} onClick={() => setContentType(t.key)} className={`chip flex items-center gap-1.5 ${contentType === t.key ? "active" : ""}`}>
            <span className="text-xs font-bold" style={{ opacity: 0.7 }}>{t.emoji}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {availableViews.map((v) => (
          <button key={v} onClick={() => setView(v)} className={`chip ${view === v ? "active" : ""}`}>
            {v === "Trending" ? "🔥" : v === "Top Rated" ? "⭐" : v === "Airing Now" ? "📡" : v === "Upcoming" ? "🗓️" : "📅"} {v}
          </button>
        ))}
      </div>

      {view === "Trending" && <div><h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)", fontFamily: "'Syne', sans-serif" }}>🔥 Trending {currentLabel}</h2><Grid items={get(trendingKey)} loading={isLoad(trendingKey)} onAdd={setModalItem} {...(getLoadMore("Trending") || {})} /></div>}
      {view === "Top Rated" && topRatedKey && <div><h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)", fontFamily: "'Syne', sans-serif" }}>⭐ Top Rated {currentLabel}</h2><Grid items={get(topRatedKey)} loading={isLoad(topRatedKey)} onAdd={setModalItem} {...(getLoadMore("Top Rated") || {})} /></div>}
      {view === "Airing Now" && <div><h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)", fontFamily: "'Syne', sans-serif" }}>📡 Currently Airing — {season} {year}</h2><Grid items={get("airing")} loading={isLoad("airing")} onAdd={setModalItem} onLoadMore={() => handleLoadMore("airing", (p) => getCurrentlyAiring(p))} loadingMore={!!loadingMore["airing"]} /></div>}
      {view === "Upcoming" && <div><h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)", fontFamily: "'Syne', sans-serif" }}>🗓️ Upcoming Next Season</h2><Grid items={get("upcoming")} loading={isLoad("upcoming")} onAdd={setModalItem} onLoadMore={() => handleLoadMore("upcoming", (p) => getUpcomingAnime(p))} loadingMore={!!loadingMore["upcoming"]} /></div>}

      {view === "Schedule" && (
        <div>
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text)", fontFamily: "'Syne', sans-serif" }}>📅 Weekly Airing Schedule <span className="text-sm font-normal ml-2" style={{ color: "var(--text3)" }}>times in your local timezone</span></h2>
          <div className="flex gap-2 mb-6 flex-wrap">
            {DAYS_ORDER.map((day) => (
              <button key={day} onClick={() => setScheduleDay(day)} className={`chip capitalize flex items-center gap-1.5 ${scheduleDay === day ? "active" : ""}`}>
                {day === todayName && <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--accent)" }} />}
                {day.slice(0, 3)}
                {day === todayName && <span className="text-[10px]" style={{ color: "var(--accent)" }}>Today</span>}
              </button>
            ))}
          </div>
          {isLoad("schedule") ? <div className="flex flex-col gap-3">{[...Array(6)].map((_, i) => <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--bg2)" }}><div className="skeleton w-10 h-14 rounded-lg" /><div className="flex-1"><div className="skeleton h-3 w-1/2 rounded mb-2" /></div></div>)}</div> :
            (get("schedule")[scheduleDay] || []).length === 0 ? <div className="text-center py-12" style={{ color: "var(--text3)" }}><p className="text-3xl mb-2">📭</p><p className="text-sm">No schedule data for this day.</p></div> :
            <div className="flex flex-col gap-3 stagger">{(get("schedule")[scheduleDay] || []).map((item) => <ScheduleItem key={item.id} item={item} onAdd={setModalItem} />)}</div>}
        </div>
      )}

      {modalItem && <AddEditModal item={modalItem} onClose={() => setModalItem(null)} />}
    </div>
  );
}
