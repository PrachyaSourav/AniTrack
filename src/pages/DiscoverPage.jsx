import React, { useState, useEffect, useRef } from "react";
import MediaCard from "../components/MediaCard";
import AddEditModal from "../components/AddEditModal";
import { searchMedia, getAllTypes } from "../utils/api";

const TYPES = getAllTypes();

// Drama types that support load more (paginated defaults)
const PAGINATED_TYPES = ["kdrama", "cdrama", "jdrama", "thaidrama", "movie", "show"];

const API_SOURCE = {
  anime: "Jikan (MyAnimeList)", manga: "Jikan (MyAnimeList)",
  manhwa: "Jikan (MyAnimeList)", manhua: "Jikan (MyAnimeList)",
  donghua: "Jikan (MyAnimeList)", lightnovel: "Jikan (MyAnimeList)",
  webnovel: "Jikan (MyAnimeList)", kdrama: "OMDB (IMDb)",
  cdrama: "OMDB (IMDb)", jdrama: "OMDB (IMDb)",
  thaidrama: "OMDB (IMDb)", movie: "OMDB (IMDb)", show: "OMDB (IMDb)",
};

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("anime");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [modalItem, setModalItem] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const debounceRef = useRef(null);

  // AI recommendation state
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAIQuery] = useState("");
  const [aiLoading, setAILoading] = useState(false);
  const [aiResults, setAIResults] = useState([]);
  const [aiError, setAIError] = useState("");

  useEffect(() => {
    handleSearch("", "anime", 1);
  }, []);

  async function handleSearch(q = query, t = type, p = 1) {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    setError("");

    try {
      const res = await searchMedia(q, t, p);
      if (p === 1) setResults(res);
      else setResults((prev) => [...prev, ...res]);
      setPage(p);
      setHasMore(res.length >= 10 && PAGINATED_TYPES.includes(t) && !q.trim());
    } catch {
      setError("Something went wrong. Please try again.");
    }

    if (p === 1) setLoading(false);
    else setLoadingMore(false);
  }

  function handleTypeChange(t) {
    setType(t);
    setQuery("");
    setResults([]);
    setPage(1);
    setHasMore(false);
    handleSearch("", t, 1);
  }

  function handleQueryChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val, type, 1), 600);
  }

  const handleLoadMore = () => {
    handleSearch(query, type, page + 1);
  };

  // AI recommendation handler — calls our Vercel serverless function
  const handleAIRecommend = async () => {
    if (!aiQuery.trim()) return;
    setAILoading(true);
    setAIError("");
    setAIResults([]);

    try {
      // Call our serverless proxy (not Anthropic directly — CORS blocked in browser)
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiQuery }),
      });

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "API error");

      const suggestions = data.suggestions || [];

      // Search for each suggestion to get real cover images
      const TYPE_MAP = {
        "Anime": "anime", "Manga": "manga", "K-Drama": "kdrama",
        "C-Drama": "cdrama", "J-Drama": "jdrama", "Thai Drama": "thaidrama",
        "Movie": "movie", "TV Show": "show",
      };

      const withImages = await Promise.allSettled(
        suggestions.map(async (s) => {
          const searchType = TYPE_MAP[s.type] || "anime";
          const results = await searchMedia(s.title, searchType, 1);
          const match = results.find((r) =>
            r.title?.toLowerCase().includes(s.title.toLowerCase()) ||
            s.title.toLowerCase().includes((r.title || "").toLowerCase())
          ) || results[0];
          return match ? { ...match, aiReason: s.reason, type: s.type } : {
            id: Math.random(),
            title: s.title,
            type: s.type,
            img: "",
            score: 0,
            aiReason: s.reason,
          };
        })
      );

      const filtered = withImages
        .filter((r) => r.status === "fulfilled" && r.value)
        .map((r) => r.value);

      setAIResults(filtered);
      if (filtered.length === 0) setAIError("Couldn't find results. Try a different description.");
    } catch (e) {
      console.error("AI error:", e);
      setAIError("AI recommendation failed. Please try again.");
    }
    setAILoading(false);
  };

  const currentType = TYPES.find((t) => t.value === type);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "'Syne', sans-serif" }}>
          Discover
        </h1>
        <p className="text-sm" style={{ color: "var(--text3)" }}>
          Search anime, manga, novels, K-dramas, movies, and more.
        </p>
      </div>

      {/* AI Recommend toggle */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setShowAI((v) => !v)}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-all duration-150 ${
            showAI
              ? "border-accent/50 text-accent bg-accent/10"
              : "border-border text-text3 hover:border-border-hover"
          }`}
          style={{ borderColor: showAI ? "var(--accent)" : "var(--border2)", color: showAI ? "var(--accent)" : "var(--text3)" }}>
          ✨ AI Recommend
        </button>
        {showAI && <span className="text-xs" style={{ color: "var(--text3)" }}>Describe what you want to watch</span>}
      </div>

      {/* AI Recommendation panel */}
      {showAI && (
        <div className="panel mb-6 fade-up" style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}>
          <p className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>✨ Tell AI what you want to watch</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAIQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAIRecommend()}
              placeholder='e.g. "something like Squid Game but Chinese" or "a sad romance anime"'
              className="input flex-1"
            />
            <button
              onClick={handleAIRecommend}
              disabled={aiLoading || !aiQuery.trim()}
              className="btn-primary px-5 flex-shrink-0 disabled:opacity-50 flex items-center gap-2">
              {aiLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Thinking...</>
              ) : "Ask AI"}
            </button>
          </div>

          {aiError && <p className="text-sm text-red-400 mt-3">{aiError}</p>}

          {aiResults.length > 0 && (
            <div className="mt-5">
              <p className="section-label mb-3">AI suggestions for "{aiQuery}"</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 stagger">
                {aiResults.map((item) => (
                  <div key={`ai-${item.id}`} className="media-card group cursor-pointer flex flex-col"
                    onClick={() => setModalItem(item)}>
                    <div className="relative aspect-[2/3] overflow-hidden" style={{ background: "var(--bg3)" }}>
                      {item.img ? (
                        <img src={item.img} alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl" style={{ color: "var(--text3)" }}>🎬</div>
                      )}
                      <div className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{ background: "color-mix(in srgb, var(--accent) 80%, transparent)", color: "var(--bg)" }}>
                        ✨ AI
                      </div>
                    </div>
                    <div className="p-2.5 flex-1">
                      <p className="text-xs font-medium leading-tight line-clamp-2" style={{ color: "var(--text)" }}>{item.title}</p>
                      <p className="text-[10px] mt-1 line-clamp-2" style={{ color: "var(--accent)" }}>{item.aiReason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search bar */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 select-none" style={{ color: "var(--text3)" }}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={(e) => { if (e.key === "Enter") { clearTimeout(debounceRef.current); handleSearch(); } }}
            placeholder={`Search ${currentType?.label || ""}...`}
            className="input pl-10"
          />
          {loading && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <span className="w-4 h-4 border-2 border-white/10 border-t-accent rounded-full animate-spin block" />
            </span>
          )}
        </div>
        <button onClick={() => handleSearch()} disabled={loading} className="btn-primary px-6 flex-shrink-0 disabled:opacity-50">
          Search
        </button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TYPES.map((t) => (
          <button key={t.value} onClick={() => handleTypeChange(t.value)}
            className={`chip flex items-center gap-1.5 ${type === t.value ? "active" : ""}`}>
            <span className="text-xs font-bold" style={{ opacity: 0.7 }}>{t.emoji}</span>
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
      ) : error ? (
        <div className="text-center py-20" style={{ color: "var(--text3)" }}>
          <p className="text-4xl mb-3">🔎</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--text3)" }}>
          <p className="text-4xl mb-3">🔎</p>
          <p className="text-sm">No results found. Try a specific title!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger">
            {results.map((item) => (
              <MediaCard key={`${item.type}-${item.id}`} item={item} onAddClick={setModalItem} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button onClick={handleLoadMore} disabled={loadingMore}
                className="btn-ghost flex items-center gap-2 disabled:opacity-50">
                {loadingMore ? (
                  <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Loading more...</>
                ) : "Load more →"}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && results.length > 0 && (
        <p className="mt-6 text-center text-xs" style={{ color: "var(--text3)" }}>
          📡 Data from {API_SOURCE[type]}
        </p>
      )}

      {modalItem && <AddEditModal item={modalItem} onClose={() => setModalItem(null)} />}
    </div>
  );
}
