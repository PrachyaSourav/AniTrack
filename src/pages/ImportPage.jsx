import React, { useState } from "react";
import { useList } from "../context/ListContext";
import { searchMedia } from "../utils/api";

const MAL_STATUS_MAP = {
  "1": "Watching", "2": "Completed", "3": "On Hold",
  "4": "Dropped", "6": "Plan to Watch",
  "watching": "Watching", "completed": "Completed", "on_hold": "On Hold",
  "dropped": "Dropped", "plan_to_watch": "Plan to Watch",
};

export default function ImportPage() {
  const { addOrUpdate, list } = useList();
  const [tab, setTab] = useState("mal");
  const [xmlText, setXmlText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);

  const parseMALXML = (xml) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const entries = [...doc.querySelectorAll("anime, manga")];
    return entries.map((entry) => ({
      title: entry.querySelector("series_title, manga_title")?.textContent || "",
      status: MAL_STATUS_MAP[entry.querySelector("my_status")?.textContent] || "Plan to Watch",
      progress: parseInt(entry.querySelector("my_watched_episodes, my_read_chapters")?.textContent || "0"),
      total: parseInt(entry.querySelector("series_episodes, series_chapters")?.textContent || "0"),
      rating: Math.round((parseInt(entry.querySelector("my_score")?.textContent || "0")) / 1) || 0,
      type: entry.tagName === "anime" ? "Anime" : "Manga",
      malId: parseInt(entry.querySelector("series_animedb_id, series_mangadb_id")?.textContent || "0"),
    }));
  };

  const parseAniListJSON = (json) => {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    const entries = data?.data?.MediaListCollection?.lists?.flatMap((l) => l.entries) || [];
    return entries.map((e) => ({
      title: e.media?.title?.english || e.media?.title?.romaji || "",
      status: MAL_STATUS_MAP[e.status?.toLowerCase()] || "Plan to Watch",
      progress: e.progress || 0,
      total: e.media?.episodes || e.media?.chapters || 0,
      rating: e.score || 0,
      type: e.media?.type === "MANGA" ? "Manga" : "Anime",
      malId: e.media?.idMal || null,
    }));
  };

  const handleImport = async () => {
    setImporting(true);
    setResults(null);
    setProgress(0);

    let entries = [];
    try {
      if (tab === "mal") {
        entries = parseMALXML(xmlText);
      } else {
        entries = parseAniListJSON(jsonText);
      }
    } catch (e) {
      setResults({ error: "Could not parse file. Make sure you pasted the correct format." });
      setImporting(false);
      return;
    }

    if (entries.length === 0) {
      setResults({ error: "No entries found in the file." });
      setImporting(false);
      return;
    }

    let imported = 0;
    let skipped = 0;
    const existingIds = new Set(list.map((x) => x.malId || x.id));

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      setProgress(Math.round((i / entries.length) * 100));

      if (!entry.title) { skipped++; continue; }

      // Search for the item to get cover image and proper ID
      try {
        const searchType = entry.type === "Anime" ? "anime" : "manga";
        const results = await searchMedia(entry.title, searchType);
        const match = results.find((r) =>
          r.title?.toLowerCase() === entry.title?.toLowerCase() ||
          r.malId === entry.malId
        ) || results[0];

        if (match) {
          await addOrUpdate({
            id: match.id,
            title: match.title || entry.title,
            type: entry.type,
            img: match.img || "",
            status: entry.status,
            progress: entry.progress,
            total: entry.total || match.episodes || 0,
            rating: entry.rating,
            note: "",
            malId: entry.malId,
          });
          imported++;
        } else {
          skipped++;
        }
      } catch (e) {
        skipped++;
      }

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 200));
    }

    setProgress(100);
    setResults({ imported, skipped, total: entries.length });
    setImporting(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Import List</h1>
        <p className="text-white/40 text-sm">Import your existing list from MyAnimeList or AniList</p>
      </div>

      {/* Source tabs */}
      <div className="flex gap-2 mb-8">
        <button onClick={() => setTab("mal")} className={`chip ${tab === "mal" ? "active" : ""}`}>📋 MyAnimeList</button>
        <button onClick={() => setTab("anilist")} className={`chip ${tab === "anilist" ? "active" : ""}`}>📊 AniList</button>
      </div>

      {/* MAL Instructions */}
      {tab === "mal" && (
        <div className="flex flex-col gap-6">
          <div className="panel">
            <p className="section-label mb-3">📋 How to export from MyAnimeList</p>
            <ol className="text-sm text-white/60 space-y-2 list-decimal list-inside">
              <li>Go to 👉 <a href="https://myanimelist.net/panel.php?go=export" target="_blank" rel="noreferrer" className="text-accent hover:underline">myanimelist.net/panel.php?go=export</a></li>
              <li>Click <strong className="text-white/80">"Export Anime List"</strong> or <strong className="text-white/80">"Export Manga List"</strong></li>
              <li>Download the <code className="text-accent/80">.xml.gz</code> file and extract it</li>
              <li>Open the <code className="text-accent/80">.xml</code> file in Notepad and copy all the text</li>
              <li>Paste it below and click Import</li>
            </ol>
          </div>
          <div>
            <label className="section-label block mb-2">Paste your MAL XML here</label>
            <textarea value={xmlText} onChange={(e) => setXmlText(e.target.value)}
              placeholder={'<?xml version="1.0" encoding="UTF-8"?>\n<myanimelist>\n  <anime>...</anime>\n</myanimelist>'}
              rows={10} className="input font-mono text-xs resize-none" />
          </div>
        </div>
      )}

      {/* AniList Instructions */}
      {tab === "anilist" && (
        <div className="flex flex-col gap-6">
          <div className="panel">
            <p className="section-label mb-3">📊 How to export from AniList</p>
            <ol className="text-sm text-white/60 space-y-2 list-decimal list-inside">
              <li>Go to 👉 <a href="https://anilist.co/settings/lists" target="_blank" rel="noreferrer" className="text-accent hover:underline">anilist.co/settings/lists</a></li>
              <li>Scroll down and click <strong className="text-white/80">"Export Lists"</strong></li>
              <li>Download the JSON file</li>
              <li>Open it in Notepad and copy all the text</li>
              <li>Paste it below and click Import</li>
            </ol>
          </div>
          <div>
            <label className="section-label block mb-2">Paste your AniList JSON here</label>
            <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)}
              placeholder={'{"data": {"MediaListCollection": ...}}'}
              rows={10} className="input font-mono text-xs resize-none" />
          </div>
        </div>
      )}

      {/* Progress */}
      {importing && (
        <div className="panel mt-6">
          <p className="text-sm text-white/70 mb-3">Importing... {progress}%</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-white/30 mt-2">This may take a few minutes depending on list size. Please don't close this page.</p>
        </div>
      )}

      {/* Results */}
      {results && !results.error && (
        <div className="panel mt-6 border-accent/30 bg-accent/5">
          <p className="text-accent font-semibold mb-2">✅ Import complete!</p>
          <p className="text-sm text-white/60">Successfully imported <strong className="text-white">{results.imported}</strong> items</p>
          {results.skipped > 0 && <p className="text-sm text-white/40 mt-1">Skipped {results.skipped} items (not found or already in list)</p>}
        </div>
      )}
      {results?.error && (
        <div className="panel mt-6 border-red-500/30 bg-red-500/5">
          <p className="text-red-400 font-semibold mb-1">❌ Import failed</p>
          <p className="text-sm text-white/50">{results.error}</p>
        </div>
      )}

      {/* Import button */}
      {!importing && (
        <button
          onClick={handleImport}
          disabled={tab === "mal" ? !xmlText.trim() : !jsonText.trim()}
          className="btn-primary w-full mt-6 disabled:opacity-40"
        >
          Import List →
        </button>
      )}
    </div>
  );
}
