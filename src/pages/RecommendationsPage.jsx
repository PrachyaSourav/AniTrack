import React, { useState, useEffect } from "react";
import { useList } from "../context/ListContext";
import { searchMedia } from "../utils/api";
import AddEditModal from "../components/AddEditModal";

export default function RecommendationsPage() {
  const { list } = useList();
  const [recs, setRecs] = useState({ anime: [], manga: [] });
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null);

  useEffect(() => {
    if (list.length === 0) { setLoading(false); return; }
    generateRecs();
  }, [list]);

  const generateRecs = async () => {
    setLoading(true);
    const seenIds = new Set(list.map((x) => x.id));
    const [anime, manga] = await Promise.all([
      searchMedia("", "anime"),
      searchMedia("", "manga"),
    ]);
    setRecs({
      anime: anime.filter((x) => !seenIds.has(x.id)).slice(0, 12),
      manga: manga.filter((x) => !seenIds.has(x.id)).slice(0, 12),
    });
    setLoading(false);
  };

  const topWatched = list.filter((x) => x.status === "Completed").slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8"><h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>For You</h1><p className="text-white/40 text-sm">Recommendations based on your list</p></div>
      {list.length === 0 ? (
        <div className="panel text-center py-16"><p className="text-5xl mb-4">🎯</p><p className="text-white/60 text-lg mb-2">No recommendations yet</p><p className="text-white/30 text-sm">Add items to your list first!</p></div>
      ) : (
        <div className="flex flex-col gap-10">
          {topWatched.length > 0 && (
            <div className="panel"><p className="section-label mb-3">🎯 Based on your list</p>
              <div className="flex items-center gap-3 flex-wrap">{topWatched.map((item) => (<div key={item.id} className="flex items-center gap-2 bg-surface-3 rounded-full px-3 py-1.5"><span className="text-xs text-white/70">{item.title}</span></div>))}</div>
            </div>
          )}
          {["anime","manga"].map((type) => (
            <div key={type}>
              <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>{type === "anime" ? "🎌 Anime you might like" : "📚 Manga you might like"}</h2>
              {loading ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">{[...Array(6)].map((_, i) => <div key={i}><div className="skeleton aspect-[2/3] rounded-xl mb-2" /></div>)}</div> :
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
                {recs[type].map((item) => (
                  <div key={item.id} className="media-card group cursor-pointer flex flex-col" onClick={() => setModalItem(item)}>
                    <div className="relative aspect-[2/3] overflow-hidden bg-surface-3">
                      {item.img ? <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.style.display="none"; }} /> : <div className="w-full h-full flex items-center justify-center text-3xl text-white/10">🎌</div>}
                      {item.score > 0 && <div className="absolute top-2 left-2 bg-black/70 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-md">★ {item.score}</div>}
                    </div>
                    <div className="p-2.5"><p className="text-xs font-medium text-white/90 line-clamp-2">{item.title}</p></div>
                  </div>
                ))}
              </div>}
            </div>
          ))}
        </div>
      )}
      {modalItem && <AddEditModal item={modalItem} onClose={() => setModalItem(null)} />}
    </div>
  );
}
