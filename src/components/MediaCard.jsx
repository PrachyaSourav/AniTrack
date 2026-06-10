import React, { useState } from "react";
import { useList } from "../context/ListContext";

export default function MediaCard({ item, onAddClick }) {
  const { getItem } = useList();
  const [imgError, setImgError] = useState(!item.img);
  const [showLinks, setShowLinks] = useState(false);
  const existing = getItem(item.id);

  const statusColors = { Watching: "text-blue-400", Completed: "text-accent", Dropped: "text-red-400", "Plan to Watch": "text-yellow-400", "On Hold": "text-purple-400" };

  return (
    <div className="media-card group flex flex-col">
      <div className="relative aspect-[2/3] overflow-hidden cursor-pointer" style={{ background: "var(--bg3)" }} onClick={() => onAddClick(item)}>
        {!imgError ? (
          <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ color: "var(--text3)" }}>
            <span className="text-3xl">{item.type === "Anime" || item.type === "Donghua" ? "🎌" : item.type === "K-Drama" || item.type === "C-Drama" || item.type === "J-Drama" || item.type === "Thai Drama" ? "🎭" : item.type === "Movie" ? "🎬" : item.type === "TV Show" ? "📺" : ["Light Novel","Web Novel"].includes(item.type) ? "📖" : "📚"}</span>
            <span className="text-[10px] text-center px-2">{item.title}</span>
          </div>
        )}
        {item.score > 0 && <div className="absolute top-2 left-2 bg-black/70 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-md">★ {item.score}</div>}
        {existing && <div className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-md bg-black/70 ${statusColors[existing.status] || "text-white/60"}`}>{existing.status === "Plan to Watch" ? "Planned" : existing.status}</div>}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
          <div className="text-xs font-bold px-3 py-1.5 rounded-full shadow-lg" style={{ background: "var(--accent)", color: "var(--bg)" }}>{existing ? "Edit" : "+ Add"}</div>
        </div>
      </div>
      <div className="p-2.5 flex flex-col flex-1">
        <p className="text-sm font-medium leading-tight line-clamp-2 mb-1 cursor-pointer" style={{ color: "var(--text)" }} onClick={() => onAddClick(item)}>{item.title}</p>
        <div className="flex items-center justify-between mb-2">
          <span className="badge badge-type">{item.type}</span>
          <span className="text-[11px]" style={{ color: "var(--text3)" }}>{item.episodes > 1 ? `${item.episodes} ep` : item.episodes === 1 ? "Film" : "Ongoing"}</span>
        </div>
        {item.streamLinks?.length > 0 && (
          <div className="mt-auto">
            <button onClick={(e) => { e.stopPropagation(); setShowLinks((v) => !v); }} className="w-full text-xs py-1.5 rounded-lg border transition-all duration-150" style={{ borderColor: "var(--border2)", color: "var(--text3)" }}>
              {showLinks ? "Hide links ▲" : "▶ Where to watch"}
            </button>
            {showLinks && (
              <div className="mt-2 flex flex-col gap-1">
                {item.streamLinks.map((link) => (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150" style={{ background: "var(--bg3)", color: "var(--text2)" }}>
                    <span>{link.icon}</span><span>{link.name}</span><span className="ml-auto" style={{ color: "var(--text3)" }}>↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
