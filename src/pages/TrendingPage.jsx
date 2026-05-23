import React, { useState, useEffect } from "react";
import AddEditModal from "../components/AddEditModal";
import {
  getTrendingAnime, getTrendingManga, getTopRatedAnime,
  getCurrentlyAiring, getUpcomingAnime, getWeeklySchedule,
  getCurrentSeason, DAYS_ORDER,
} from "../utils/trendingApi";
import { useList } from "../context/ListContext";

// ─── Mini card for trending/upcoming ─────────────────────────
function AnimeCard({ item, onAdd }) {
  const { getItem } = useList();
  const [imgErr, setImgErr] = useState(false);
  const existing = getItem(item.id);

  const statusColors = {
    Watching: "text-blue-400", Completed: "text-accent",
    Dropped: "text-red-400", "Plan to Watch": "text-yellow-400", "On Hold": "text-purple-400",
  };

  return (
    <div
      className="media-card group cursor-pointer flex flex-col"
      onClick={() => onAdd({ ...item, type: item.type === "Manga" ? "Manga" : "Anime" })}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-surface-3">
        {!imgErr && item.img ? (
          <img src={item.img} alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-white/10">🎌</div>
        )}
        {item.score > 0 && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-md">
            ★ {item.score}
          </div>
        )}
        {item.rank && (
          <div className="absolute top-2 right-2 bg-accent/80 text-surface text-xs font-bold px-2 py-0.5 rounded-md">
            #{item.rank}
          </div>
        )}
        {existing && (
          <div className={`absolute bottom-2 left-2 text-xs font-medium px-2 py-0.5 rounded-md bg-black/70 ${statusColors[existing.status] || "text-white/60"}`}>
            {existing.status === "Plan to Watch" ? "Planned" : existing.status}
          </div>
        )}
        <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="bg-accent text-surface text-xs font-bold px-3 py-1.5 rounded-full">
            {existing ? "Edit" : "+ Add"}
          </div>
        </div>
      </div>
      <div className="p-2.5 flex-1 flex flex-col">
        <p className="text-xs font-medium text-white/90 leading-tight line-clamp-2">{item.title}</p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {item.genres?.slice(0, 1).map((g) => (
            <span key={g} className="badge badge-type text-[10px]">{g}</span>
          ))}
          {item.episodes > 0 && (
            <span className="text-[10px] text-white/25">{item.episodes} ep</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Schedule day card ────────────────────────────────────────
function ScheduleItem({ item, onAdd }) {
  const [imgErr, setImgErr] = useState(false);
  const { getItem } = useList();
  const existing = getItem(item.id);

  // Convert broadcast time to local timezone
  const getLocalTime = () => {
    if (!item.broadcast?.time) return null;
    try {
      const [h, m] = item.broadcast.time.split(":").map(Number);
      const jst = new Date();
      jst.setUTCHours(h - 9, m, 0); // JST = UTC+9
      return jst.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
    } catch { return null; }
  };

  const localTime = getLocalTime();

  return (
    <div
      className="flex items-center gap-3 p-3 bg-surface-2 border border-border rounded-xl hover:border-border-hover cursor-pointer transition-all duration-150 group"
      onClick={() => onAdd({ ...item, type: "Anime" })}
    >
      <div className="w-10 h-14 rounded-lg overflow-hidden bg-surface-3 flex-shrink-0">
        {!imgErr && item.img ? (
          <img src={item.img} alt={item.title} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-lg">🎌</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">{item.title}</p>
        <div className="flex items-center gap-2 mt-1">
          {item.score > 0 && <span className="text-xs text-yellow-400">★ {item.score}</span>}
          {localTime && <span className="text-xs text-accent/70">🕐 {localTime}</span>}
          {existing && <span className="text-xs text-white/30">{existing.status}</span>}
        </div>
        {item.genres?.length > 0 && (
          <p className="text-[11px] text-white/25 mt-0.5">{item.genres.slice(0, 2).join(" · ")}</p>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-accent">+</div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────
function Section({ title, emoji, children, loading }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
        <span>{emoji}</span>{title}
      </h2>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[2/3] rounded-xl mb-2" />
              <div className="skeleton h-2.5 w-3/4 rounded mb-1" />
              <div className="skeleton h-2.5 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
const TABS = ["Trending", "Top Rated", "Airing Now", "Upcoming", "Schedule"];

export default function TrendingPage() {
  const [tab, setTab] = useState("Trending");
  const [modalItem, setModalItem] = useState(null);
  const [data, setData] = useState({
    trending: [], trendingManga: [], topRated: [],
    airing: [], upcoming: [], schedule: {},
  });
  const [loading, setLoading] = useState({
    trending: true, topRated: true, airing: true, upcoming: true, schedule: true,
  });
  const [scheduleDay, setScheduleDay] = useState(
    new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
  );

  const { season, year } = getCurrentSeason();

  useEffect(() => {
    // Load trending immediately
    getTrendingAnime().then((d) => { setData((p) => ({ ...p, trending: d })); setLoading((p) => ({ ...p, trending: false })); });
    getTrendingManga().then((d) => { setData((p) => ({ ...p, trendingManga: d })); });
    getTopRatedAnime().then((d) => { setData((p) => ({ ...p, topRated: d })); setLoading((p) => ({ ...p, topRated: false })); });
    getCurrentlyAiring().then((d) => { setData((p) => ({ ...p, airing: d })); setLoading((p) => ({ ...p, airing: false })); });
    getUpcomingAnime().then((d) => { setData((p) => ({ ...p, upcoming: d })); setLoading((p) => ({ ...p, upcoming: false })); });
    getWeeklySchedule().then((d) => { setData((p) => ({ ...p, schedule: d })); setLoading((p) => ({ ...p, schedule: false })); });
  }, []);

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
          Trending & Upcoming
        </h1>
        <p className="text-white/40 text-sm">
          {season} {year} season · Updated daily from MyAnimeList
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`chip ${tab === t ? "active" : ""}`}>
            {t === "Trending" ? "🔥" : t === "Top Rated" ? "⭐" : t === "Airing Now" ? "📡" : t === "Upcoming" ? "🗓️" : "📅"} {t}
          </button>
        ))}
      </div>

      {/* Trending */}
      {tab === "Trending" && (
        <div className="flex flex-col gap-10">
          <Section title="Trending Anime This Week" emoji="🔥" loading={loading.trending}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
              {data.trending.map((item) => <AnimeCard key={item.id} item={item} onAdd={setModalItem} />)}
            </div>
          </Section>
          <Section title="Trending Manga" emoji="📚" loading={loading.trending}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
              {data.trendingManga.map((item) => <AnimeCard key={item.id} item={item} onAdd={setModalItem} />)}
            </div>
          </Section>
        </div>
      )}

      {/* Top Rated */}
      {tab === "Top Rated" && (
        <Section title="Top Rated Anime of All Time" emoji="⭐" loading={loading.topRated}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
            {data.topRated.map((item) => <AnimeCard key={item.id} item={item} onAdd={setModalItem} />)}
          </div>
        </Section>
      )}

      {/* Airing Now */}
      {tab === "Airing Now" && (
        <Section title={`Currently Airing — ${season} ${year}`} emoji="📡" loading={loading.airing}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
            {data.airing.map((item) => <AnimeCard key={item.id} item={item} onAdd={setModalItem} />)}
          </div>
        </Section>
      )}

      {/* Upcoming */}
      {tab === "Upcoming" && (
        <Section title="Upcoming Anime Next Season" emoji="🗓️" loading={loading.upcoming}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
            {data.upcoming.map((item) => <AnimeCard key={item.id} item={item} onAdd={setModalItem} />)}
          </div>
        </Section>
      )}

      {/* Weekly Schedule */}
      {tab === "Schedule" && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            <span>📅</span> Weekly Airing Schedule
            <span className="text-sm font-normal text-white/30 ml-2">times shown in your local timezone</span>
          </h2>

          {/* Day selector */}
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

          {loading.schedule ? (
            <div className="flex flex-col gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl">
                  <div className="skeleton w-10 h-14 rounded-lg" />
                  <div className="flex-1"><div className="skeleton h-3 w-1/2 rounded mb-2" /><div className="skeleton h-2.5 w-1/3 rounded" /></div>
                </div>
              ))}
            </div>
          ) : (data.schedule[scheduleDay] || []).length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">No schedule data for this day yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 stagger">
              {(data.schedule[scheduleDay] || []).map((item) => (
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
