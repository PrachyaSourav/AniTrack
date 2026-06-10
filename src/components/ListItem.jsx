import React, { useState } from "react";
import { getAllTypes } from "../utils/api";

const STATUS_BADGE = { Watching: "badge-watching", Completed: "badge-completed", Dropped: "badge-dropped", "Plan to Watch": "badge-plan", "On Hold": "badge-hold" };

function getLinksForType(title, type) {
  const q = encodeURIComponent(title || "");
  if (type === "Anime") return [
    { name: "Crunchyroll", url: `https://www.crunchyroll.com/search?q=${q}`, icon: "🟠" },
    { name: "Netflix", url: `https://www.netflix.com/search?q=${q}`, icon: "🔴" },
    { name: "9anime", url: `https://9anime.to/filter?keyword=${q}`, icon: "🔵" },
  ];
  if (type === "Donghua") return [
    { name: "Bilibili", url: `https://www.bilibili.tv/en/search?keyword=${q}`, icon: "🩵" },
    { name: "WeTV", url: `https://wetv.vip/en/search?query=${q}`, icon: "🟩" },
  ];
  if (type === "K-Drama") return [
    { name: "Viki", url: `https://www.viki.com/search?q=${q}`, icon: "🟡" },
    { name: "Netflix", url: `https://www.netflix.com/search?q=${q}`, icon: "🔴" },
  ];
  if (type === "C-Drama") return [
    { name: "WeTV", url: `https://wetv.vip/en/search?query=${q}`, icon: "🟩" },
    { name: "iQIYI", url: `https://www.iq.com/search?query=${q}`, icon: "🟢" },
  ];
  if (["Manga","Manhwa","Manhua"].includes(type)) return [
    { name: "MangaDex", url: `https://mangadex.org/search?q=${q}`, icon: "🟠" },
    { name: "ComicK", url: `https://comick.io/search?q=${q}`, icon: "🟣" },
  ];
  if (["Light Novel","Web Novel"].includes(type)) return [
    { name: "NovelUpdates", url: `https://www.novelupdates.com/?s=${q}`, icon: "📖" },
    { name: "Royal Road", url: `https://www.royalroad.com/fictions/search?title=${q}`, icon: "👑" },
  ];
  if (["Movie","TV Show","J-Drama","Thai Drama"].includes(type)) return [
    { name: "Netflix", url: `https://www.netflix.com/search?q=${q}`, icon: "🔴" },
    { name: "Prime Video", url: `https://www.amazon.com/s?k=${q}&i=instant-video`, icon: "🔵" },
  ];
  return [];
}

export default function ListItem({ item, onEdit }) {
  const [imgError, setImgError] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const progressPct = item.total > 0 ? Math.min(100, Math.round((item.progress / item.total) * 100)) : item.status === "Completed" ? 100 : 0;
  const progressLabel = item.total > 0 ? `${item.progress} / ${item.total}` : item.progress > 0 ? `${item.progress} ep` : "Not started";
  const links = getLinksForType(item.title, item.type);

  return (
    <div className="flex items-start gap-4 p-4 border rounded-xl hover:border-border-hover transition-all duration-150" style={{ background: "var(--bg2)", borderColor: "var(--border)" }}>
      <div className="w-12 h-[68px] rounded-lg overflow-hidden flex-shrink-0 cursor-pointer" style={{ background: "var(--bg3)" }} onClick={onEdit}>
        {!imgError ? <img src={item.img} alt={item.title} className="w-full h-full object-cover" onError={() => setImgError(true)} /> : <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text3)" }}>🎬</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight truncate cursor-pointer" style={{ color: "var(--text)" }} onClick={onEdit}>{item.title}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`badge ${STATUS_BADGE[item.status] || "badge-plan"}`}>{item.status}</span>
          <span className="badge badge-type">{item.type}</span>
          {item.rating > 0 && <span className="text-xs font-medium text-yellow-400">★ {item.rating}</span>}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="progress-bar flex-1"><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>
          <span className="text-[11px] flex-shrink-0 tabular-nums" style={{ color: "var(--text3)" }}>{progressLabel}</span>
        </div>
        {item.note && <p className="text-xs italic mt-1.5 truncate" style={{ color: "var(--text3)" }}>"{item.note}"</p>}
        {links.length > 0 && (
          <div className="mt-2">
            <button onClick={() => setShowLinks((v) => !v)} className="text-xs transition-colors" style={{ color: "var(--text3)" }}>{showLinks ? "▲ Hide links" : "▶ Where to watch"}</button>
            {showLinks && (
              <div className="flex flex-wrap gap-2 mt-2">
                {links.map((link) => (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all" style={{ background: "var(--bg3)", color: "var(--text2)", borderColor: "var(--border)" }}>
                    <span>{link.icon}</span><span>{link.name}</span><span style={{ color: "var(--text3)" }}>↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <button onClick={onEdit} className="text-xs flex-shrink-0 pt-0.5 transition-colors" style={{ color: "var(--text3)" }}>Edit →</button>
    </div>
  );
}
