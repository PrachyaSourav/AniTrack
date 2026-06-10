import React, { useState } from "react";
import { useList } from "../context/ListContext";
import { searchMedia } from "../utils/api";

const MAL_STATUS_MAP = { "1":"Watching","2":"Completed","3":"On Hold","4":"Dropped","6":"Plan to Watch","watching":"Watching","completed":"Completed","on_hold":"On Hold","dropped":"Dropped","plan_to_watch":"Plan to Watch" };

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
      rating: parseInt(entry.querySelector("my_score")?.textContent || "0"),
      type: entry.tagName === "anime" ? "Anime" : "Manga",
    }));
  };

  const handleImport = async () => {
    setImporting(true); setResults(null); setProgress(0);
    let entries = [];
    try { entries = tab === "mal" ? parseMALXML(xmlText) : JSON.parse(jsonText); }
    catch (e) { setResults({ error: "Could not parse file." }); setImporting(false); return; }
    if (entries.length === 0) { setResults({ error: "No entries found." }); setImporting(false); return; }

    let imported = 0, skipped = 0;
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      setProgress(Math.round((i / entries.length) * 100));
      if (!entry.title) { skipped++; continue; }
      try {
        const res = await searchMedia(entry.title, entry.type === "Anime" ? "anime" : "manga", 1);
        const match = res.find((r) => r.title?.toLowerCase() === entry.title?.toLowerCase()) || res[0];
        if (match) { await addOrUpdate({ id: match.id, title: match.title || entry.title, type: entry.type, img: match.img || "", status: entry.status, progress: entry.progress, total: entry.total || match.episodes || 0, rating: entry.rating, note: "" }); imported++; }
        else skipped++;
      } catch { skipped++; }
      await new Promise((r) => setTimeout(r, 200));
    }
    setProgress(100); setResults({ imported, skipped, total: entries.length }); setImporting(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8"><h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Import List</h1><p className="text-white/40 text-sm">Import from MyAnimeList or AniList</p></div>
      <div className="flex gap-2 mb-8"><button onClick={() => setTab("mal")} className={`chip ${tab === "mal" ? "active" : ""}`}>📋 MyAnimeList</button><button onClick={() => setTab("anilist")} className={`chip ${tab === "anilist" ? "active" : ""}`}>📊 AniList</button></div>
      <div className="panel mb-6">
        <p className="section-label mb-3">How to export</p>
        {tab === "mal" ? <ol className="text-sm text-white/60 space-y-2 list-decimal list-inside"><li>Go to <a href="https://myanimelist.net/panel.php?go=export" target="_blank" rel="noreferrer" className="text-accent">myanimelist.net export</a></li><li>Download and extract the .xml.gz file</li><li>Open the .xml in Notepad, copy all text</li><li>Paste below and click Import</li></ol> :
         <ol className="text-sm text-white/60 space-y-2 list-decimal list-inside"><li>Go to <a href="https://anilist.co/settings/lists" target="_blank" rel="noreferrer" className="text-accent">anilist.co/settings/lists</a></li><li>Click Export Lists</li><li>Copy the JSON content</li><li>Paste below and click Import</li></ol>}
      </div>
      <div><label className="section-label block mb-2">Paste your {tab === "mal" ? "MAL XML" : "AniList JSON"} here</label>
        {tab === "mal" ? <textarea value={xmlText} onChange={(e) => setXmlText(e.target.value)} placeholder={'<?xml version="1.0"?>\n<myanimelist>...</myanimelist>'} rows={8} className="input font-mono text-xs resize-none" /> :
         <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} placeholder='{"data": {"MediaListCollection": ...}}' rows={8} className="input font-mono text-xs resize-none" />}
      </div>
      {importing && <div className="panel mt-4"><p className="text-sm text-white/70 mb-2">Importing... {progress}%</p><div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div></div>}
      {results && !results.error && <div className="panel mt-4 border-accent/30 bg-accent/5"><p className="text-accent font-semibold">✅ Done! Imported {results.imported} items{results.skipped > 0 ? `, skipped ${results.skipped}` : ""}.</p></div>}
      {results?.error && <div className="panel mt-4 border-red-500/30 bg-red-500/5"><p className="text-red-400">{results.error}</p></div>}
      {!importing && <button onClick={handleImport} disabled={tab === "mal" ? !xmlText.trim() : !jsonText.trim()} className="btn-primary w-full mt-4 disabled:opacity-40">Import →</button>}
    </div>
  );
}
