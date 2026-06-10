import React, { useMemo, useState, useEffect } from "react";
import { useList } from "../context/ListContext";
import { useNavigate, Link } from "react-router-dom";
import { getTrendingAnime, getCurrentlyAiring, getCurrentSeason } from "../utils/trendingApi";

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="panel flex flex-col gap-1">
      <p className="section-label">{label}</p>
      <p className="text-3xl font-bold" style={{ color: accent ? "var(--accent)" : "var(--text)", fontFamily: "'Syne', sans-serif" }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: "var(--text3)" }}>{sub}</p>}
    </div>
  );
}

function MiniBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-28 flex-shrink-0" style={{ color: "var(--text3)" }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border2)" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs w-6 text-right tabular-nums" style={{ color: "var(--text3)" }}>{count}</span>
    </div>
  );
}

function TrendingWidget({ items, loading, title, emoji }) {
  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-4">
        <p className="section-label">{emoji} {title}</p>
        <Link to="/trending" className="text-xs transition-colors" style={{ color: "var(--accent)" }}>See all →</Link>
      </div>
      {loading ? (
        <div className="flex gap-3 overflow-hidden">{[...Array(4)].map((_, i) => <div key={i} className="flex-shrink-0 w-20"><div className="skeleton aspect-[2/3] rounded-lg mb-1.5" /><div className="skeleton h-2.5 w-full rounded" /></div>)}</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {items.slice(0, 8).map((item) => (
            <Link key={item.id} to="/trending" className="flex-shrink-0 w-20 group cursor-pointer">
              <div className="aspect-[2/3] rounded-lg overflow-hidden mb-1.5 relative" style={{ background: "var(--bg3)" }}>
                {item.img && <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" onError={(e) => { e.target.style.display = "none"; }} />}
                {item.score > 0 && <div className="absolute bottom-1 left-1 text-yellow-400 text-[9px] font-bold px-1 rounded" style={{ background: "rgba(0,0,0,0.7)" }}>★{item.score}</div>}
              </div>
              <p className="text-[10px] leading-tight line-clamp-2" style={{ color: "var(--text3)" }}>{item.title}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { list } = useList();
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [airing, setAiring] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [airingLoading, setAiringLoading] = useState(true);
  const { season, year } = getCurrentSeason();

  useEffect(() => {
    getTrendingAnime().then((d) => { setTrending(d); setTrendingLoading(false); });
    getCurrentlyAiring().then((d) => { setAiring(d); setAiringLoading(false); });
  }, []);

  const stats = useMemo(() => {
    const completed = list.filter((x) => x.status === "Completed").length;
    const watching = list.filter((x) => x.status === "Watching").length;
    const planned = list.filter((x) => x.status === "Plan to Watch").length;
    const dropped = list.filter((x) => x.status === "Dropped").length;
    const onHold = list.filter((x) => x.status === "On Hold").length;
    const rated = list.filter((x) => x.rating > 0);
    const avgRating = rated.length ? (rated.reduce((a, b) => a + b.rating, 0) / rated.length).toFixed(1) : "—";
    const byType = {};
    list.forEach((x) => { byType[x.type] = (byType[x.type] || 0) + 1; });
    const topRated = [...list].filter((x) => x.rating > 0).sort((a, b) => b.rating - a.rating).slice(0, 5);
    const recent = [...list].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)).slice(0, 5);
    return { completed, watching, planned, dropped, onHold, avgRating, byType, topRated, recent, total: list.length };
  }, [list]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "'Syne', sans-serif" }}>Dashboard</h1>
        <p className="text-sm" style={{ color: "var(--text3)" }}>{season} {year} season is airing now</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
        <StatCard label="Total tracked" value={stats.total} accent />
        <StatCard label="Completed" value={stats.completed} sub={`${stats.total > 0 ? Math.round(stats.completed / stats.total * 100) : 0}% of list`} />
        <StatCard label="Watching now" value={stats.watching} />
        <StatCard label="Avg rating" value={stats.avgRating} sub={stats.avgRating !== "—" ? "out of 10" : "Rate some items!"} />
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <TrendingWidget items={trending} loading={trendingLoading} title="Trending Anime" emoji="🔥" />
        <TrendingWidget items={airing} loading={airingLoading} title={`Airing — ${season} ${year}`} emoji="📡" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="panel">
          <p className="section-label mb-4">Status breakdown</p>
          <div className="flex flex-col gap-3">
            {[
              { label: "Watching", count: stats.watching, color: "#60a5fa" },
              { label: "Completed", count: stats.completed, color: "var(--accent)" },
              { label: "Plan to Watch", count: stats.planned, color: "#facc15" },
              { label: "On Hold", count: stats.onHold, color: "#a78bfa" },
              { label: "Dropped", count: stats.dropped, color: "#f87171" },
            ].map((s) => <MiniBar key={s.label} {...s} total={stats.total} />)}
          </div>
        </div>

        <div className="panel">
          <p className="section-label mb-4">By media type</p>
          {Object.keys(stats.byType).length === 0 ? <p className="text-xs" style={{ color: "var(--text3)" }}>Nothing tracked yet.</p> : (
            <div className="flex flex-col gap-3">
              {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <MiniBar key={type} label={type} count={count} total={stats.total} color="var(--accent)" />
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <p className="section-label mb-4">Top rated</p>
          {stats.topRated.length === 0 ? <p className="text-xs" style={{ color: "var(--text3)" }}>Rate something to see it here.</p> : (
            <div className="flex flex-col gap-3">
              {stats.topRated.map((item, i) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold w-4 text-right tabular-nums" style={{ color: "var(--text3)" }}>{i + 1}</span>
                  <img src={item.img} alt={item.title} className="w-8 h-11 rounded object-cover" style={{ background: "var(--bg3)" }} onError={(e) => { e.target.style.display = "none"; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "var(--text2)" }}>{item.title}</p>
                    <p className="text-xs" style={{ color: "var(--text3)" }}>{item.type}</p>
                  </div>
                  <span className="text-sm font-medium flex-shrink-0 text-yellow-400">★ {item.rating}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <p className="section-label mb-4">Recently added</p>
          {stats.recent.length === 0 ? <p className="text-xs" style={{ color: "var(--text3)" }}>Nothing here yet.</p> : (
            <div className="flex flex-col gap-3">
              {stats.recent.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.img} alt={item.title} className="w-8 h-11 rounded object-cover" style={{ background: "var(--bg3)" }} onError={(e) => { e.target.style.display = "none"; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "var(--text2)" }}>{item.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs" style={{ color: "var(--text3)" }}>{item.type}</span>
                      <span style={{ color: "var(--border2)" }}>·</span>
                      <span className={`text-xs ${item.status === "Watching" ? "text-blue-400" : item.status === "Completed" ? "text-accent" : item.status === "Dropped" ? "text-red-400" : "text-yellow-400"}`}>{item.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {stats.total === 0 && (
        <div className="mt-8 text-center py-12 panel">
          <p className="text-5xl mb-4">📊</p>
          <p className="mb-4" style={{ color: "var(--text3)" }}>Start tracking to see your stats here.</p>
          <button onClick={() => navigate("/")} className="btn-primary">Go discover something →</button>
        </div>
      )}
    </div>
  );
}
