import React, { useState, useEffect, useRef } from "react";
import MediaCard from "../components/MediaCard";
import AddEditModal from "../components/AddEditModal";
import { searchMedia, getAllTypes } from "../utils/mockApi";

const TYPES = getAllTypes();

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("anime");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const inputRef = useRef(null);

  // Load initial results
  useEffect(() => {
    handleSearch("", type);
    // eslint-disable-next-line
  }, []);

  async function handleSearch(q = query, t = type) {
    setLoading(true);
    const res = await searchMedia(q, t);
    setResults(res);
    setLoading(false);
  }

  function handleTypeChange(t) {
    setType(t);
    setQuery("");
    handleSearch("", t);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-white mb-1"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Discover
        </h1>
        <p className="text-white/40 text-sm">
          Search and add anime, manga, manhwa, movies, and shows to your list.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-base">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Search ${TYPES.find((t2) => t2.value === type)?.label}...`}
            className="input pl-10"
          />
        </div>
        <button
          onClick={() => handleSearch()}
          className="btn-primary px-6 flex-shrink-0"
        >
          Search
        </button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => handleTypeChange(t.value)}
            className={`chip ${type === t.value ? "active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger">
          {[...Array(10)].map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[2/3] rounded-xl mb-2" />
              <div className="skeleton h-3 w-3/4 rounded mb-1" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-3">🔎</p>
          <p className="text-sm">No results found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger">
          {results.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onAddClick={setModalItem}
            />
          ))}
        </div>
      )}

      {/* Phase 3 note */}
      <div className="mt-10 p-4 bg-surface-2 border border-border rounded-xl text-xs text-white/30 text-center">
        📡 <strong className="text-white/50">Phase 3:</strong> This will use live data from{" "}
        <span className="text-accent/70">Jikan API</span> (anime/manga) and{" "}
        <span className="text-accent/70">TMDB</span> (movies/shows)
      </div>

      {/* Modal */}
      {modalItem && (
        <AddEditModal item={modalItem} onClose={() => setModalItem(null)} />
      )}
    </div>
  );
}
