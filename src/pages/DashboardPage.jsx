import React, { useMemo } from "react";
import { useList } from "../context/ListContext";
import { useNavigate } from "react-router-dom";

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-surface-2 border border-border rounded-xl p-4 flex flex-col gap-1">
      <p className="section-label">{label}</p>
      <p className={`text-3xl font-bold ${accent ? "text-accent" : "text-white"}`}
         style={{ fontFamily: "'Syne', sans-serif" }}>
        {value}
      </p>
      {sub && <p className="text-xs text-white/30">{sub}</p>}
    </div>
  );
}

function MiniBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/50 w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs text-white/30 w-6 text-right tabular-nums">{count}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { list } = useList();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const completed = list.filter((x) => x.status === "Completed").length;
    const watching = list.filter((x) => x.status === "Watching").length;
    const planned = list.filter((x) => x.status === "Plan to Watch").length;
    const dropped = list.filter((x) => x.status === "Dropped").length;
    const onHold = list.filter((x) => x.status === "On Hold").length;
    const rated = list.filter((x) => x.rating > 0);
    const avgRating = rated.length
      ? (rated.reduce((a, b) => a + b.rating, 0) / rated.length).toFixed(1)
      : "—";

    // Type breakdown
    const byType = {};
    list.forEach((x) => { byType[x.type] = (byType[x.type] || 0) + 1; });

    // Top rated
    const topRated = [...list]
      .filter((x) => x.rating > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    // Recent
    const recent = [...list]
      .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
      .slice(0, 5);

    return { completed, watching, planned, dropped, onHold, avgRating, byType, topRated, recent, total: list.length };
  }, [list]);

  const statusBreakdown = [
    { label: "Watching", count: stats.watching, color: "#60a5fa" },
    { label: "Completed", count: stats.completed, color: "#00C896" },
    { label: "Plan to Watch", count: stats.planned, color: "#facc15" },
    { label: "On Hold", count: stats.onHold, color: "#a78bfa" },
    { label: "Dropped", count: stats.dropped, color: "#f87171" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-white mb-1"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Dashboard
        </h1>
        <p className="text-white/40 text-sm">Your tracking stats at a glance.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
        <StatCard label="Total tracked" value={stats.total} accent />
        <StatCard label="Completed" value={stats.completed} sub={`${stats.total > 0 ? Math.round(stats.completed / stats.total * 100) : 0}% of list`} />
        <StatCard label="Watching now" value={stats.watching} />
        <StatCard label="Avg rating" value={stats.avgRating} sub={stats.avgRating !== "—" ? "out of 10" : "Rate some items!"} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="panel">
          <p className="section-label mb-4">Status breakdown</p>
          <div className="flex flex-col gap-3">
            {statusBreakdown.map((s) => (
              <MiniBar key={s.label} {...s} total={stats.total} />
            ))}
          </div>
        </div>

        {/* Type breakdown */}
        <div className="panel">
          <p className="section-label mb-4">By media type</p>
          {Object.keys(stats.byType).length === 0 ? (
            <p className="text-xs text-white/30">Nothing tracked yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(stats.byType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <MiniBar key={type} label={type} count={count} total={stats.total} color="#00C896" />
                ))}
            </div>
          )}
        </div>

        {/* Top rated */}
        <div className="panel">
          <p className="section-label mb-4">Top rated</p>
          {stats.topRated.length === 0 ? (
            <p className="text-xs text-white/30">Rate something to see it here.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.topRated.map((item, i) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-sm text-white/20 font-bold w-4 text-right tabular-nums">{i + 1}</span>
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-8 h-11 rounded object-cover bg-surface-3"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{item.title}</p>
                    <p className="text-xs text-white/30">{item.type}</p>
                  </div>
                  <span className="text-yellow-400 text-sm font-medium flex-shrink-0">★ {item.rating}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently added */}
        <div className="panel">
          <p className="section-label mb-4">Recently added</p>
          {stats.recent.length === 0 ? (
            <p className="text-xs text-white/30">Nothing here yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.recent.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-8 h-11 rounded object-cover bg-surface-3"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{item.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-white/30">{item.type}</span>
                      <span className="text-white/15">·</span>
                      <span className={`text-xs ${
                        item.status === "Watching" ? "text-blue-400" :
                        item.status === "Completed" ? "text-accent" :
                        item.status === "Dropped" ? "text-red-400" : "text-yellow-400"
                      }`}>{item.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      {stats.total === 0 && (
        <div className="mt-8 text-center py-12 panel">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-white/60 mb-4">Start tracking to see your stats here.</p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Go discover something →
          </button>
        </div>
      )}
    </div>
  );
}
