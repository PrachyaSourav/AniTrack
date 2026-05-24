import React, { useState, useEffect } from "react";
import { useList } from "../context/ListContext";
import { searchMedia } from "../utils/api";
import AddEditModal from "../components/AddEditModal";
import { getRecommendations, buildRecommendationReasons } from "../utils/recommendations";

function MediaCard({ item, reason, onAdd }) {
  const { getItem } = useList();
  const [imgErr, setImgErr] = useState(false);
  const existing = getItem(item.id);

  return (
    <div className="media-card group cursor-pointer flex flex-col" onClick={() => onAdd(item)}>
      <div className="relative aspect-[2/3] overflow-hidden bg-surface-3">
        {!imgErr && item.img ? (
          <img src={item.img} alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-white/10">🎌</div>
        )}
        {item.score > 0 && (
          <div className="absolute top-2 left-2 bg-black/70 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-md">★ {item.score}</div>
        )}
        {existing && (
          <div className="absolute top-2 right-2 bg-accent/80 text-surface text-xs font-bold px-2 py-0.5 rounded-md">In list</div>
        )}
        <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="bg-accent text-surface text-xs font-bold px-3 py-1.5 rounded-full">{existing ? "Edit" : "+ Add"}</div>
        </div>
      </div>
      <div className="p-2.5 flex-1 flex flex-col">
        <p className="text-xs font-medium text-white/90 leading-tight line-clamp-2">{item.title}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="badge badge-type text-[10px]">{item.type}</span>
        </div>
        {reason && <p className="text-[10px] text-accent/60 mt-1.5 line-clamp-1">Because: {reason}</p>}
      </div>
    </div>
  );
}

function Section({ title, emoji, items, loading, reason, onAdd }) {
  if (loading) return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>{emoji} {title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
        {[...Array(6)].map((_, i) => <div key={i}><div className="skeleton aspect-[2/3] rounded-xl mb-2" /><div className="skeleton h-2.5 w-3/4 rounded" /></div>)}
      </div>
    </div>
  );
  if (!items?.length) return null;
  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>{emoji} {title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
        {items.map((item) => <MediaCard key={`${item.type}-${item.id}`} item={item} reason={reason} onAdd={onAdd} />)}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const { list } = useList();
  const [recs, setRecs] = useState({ anime: [], manga: [], similar: [] });
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null);
  const [reasons, setReasons] = useState([]);

  useEffect(() => {
    if (list.length === 0) { setLoading(false); return; }
    generateRecs();
  }, [list]);

  const generateRecs = async () => {
    setLoading(true);
    const { topGenres, topTypes } = getRecommendations(list);
    const reasonTitles = buildRecommendationReasons(list);
    setReasons(reasonTitles);

    const seenIds = new Set(list.map((x) => x.id));

    // Search based on top genres
    const searches = await Promise.allSettled([
      topGenres[0] ? searchMedia(topGenres[0], "anime") : Promise.resolve([]),
      topGenres[1] ? searchMedia(topGenres[1], "anime") : Promise.resolve([]),
      topGenres[0] ? searchMedia(topGenres[0], "manga") : Promise.resolve([]),
      searchMedia("", "anime"), // top anime
      searchMedia("", "manga"), // top manga
    ]);

    const allAnime = [];
    const allManga = [];

    searches.forEach((r, i) => {
      if (r.status === "fulfilled") {
        const items = r.value.filter((x) => !seenIds.has(x.id));
        if (i < 2) allAnime.push(...items);
        else if (i === 2) allManga.push(...items);
        else if (i === 3) allAnime.push(...items);
        else allManga.push(...items);
      }
    });

    // Deduplicate and sort by score
    const dedupeAnime = [...new Map(allAnime.map((x) => [x.id, x])).values()]
      .sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 12);
    const dedupeManga = [...new Map(allManga.map((x) => [x.id, x])).values()]
      .sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 12);

    setRecs({ anime: dedupeAnime, manga: dedupeManga });
    setLoading(false);
  };

  const topWatched = list.filter((x) => x.status === "Completed").slice(0, 3);
  const reasonText = reasons.length > 0 ? reasons.join(", ") : "your list";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>For You</h1>
        <p className="text-white/40 text-sm">
          {list.length > 0
            ? `Recommendations based on ${reasonText}`
            : "Add items to your list to get personalized recommendations"}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="panel text-center py-16">
          <p className="text-5xl mb-4">🎯</p>
          <p className="text-white/60 text-lg mb-2">No recommendations yet</p>
          <p className="text-white/30 text-sm">Start adding anime and manga to your list and we'll suggest what to watch next!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {/* Because you watched */}
          {topWatched.length > 0 && (
            <div className="panel">
              <p className="section-label mb-3">🎯 Based on your list</p>
              <div className="flex items-center gap-3 flex-wrap">
                {topWatched.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 bg-surface-3 rounded-full px-3 py-1.5">
                    <img src={item.img} alt={item.title}
                      className="w-5 h-5 rounded-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }} />
                    <span className="text-xs text-white/70">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Section title="Anime you might like" emoji="🎌"
            items={recs.anime} loading={loading}
            reason={`you enjoyed ${reasonText}`} onAdd={setModalItem} />

          <Section title="Manga you might like" emoji="📚"
            items={recs.manga} loading={loading}
            reason={`similar to your list`} onAdd={setModalItem} />
        </div>
      )}

      {modalItem && <AddEditModal item={modalItem} onClose={() => setModalItem(null)} />}
    </div>
  );
}
