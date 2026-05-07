import React, { useState } from "react";
import { useList } from "../context/ListContext";

export default function MediaCard({ item, onAddClick }) {
  const { getItem } = useList();
  const [imgError, setImgError] = useState(false);
  const existing = getItem(item.id);

  const statusColor = {
    Watching: "text-blue-400",
    Completed: "text-accent",
    Dropped: "text-red-400",
    "Plan to Watch": "text-yellow-400",
    "On Hold": "text-purple-400",
  };

  return (
    <div className="media-card group cursor-pointer" onClick={() => onAddClick(item)}>
      {/* Cover image */}
      <div className="relative aspect-[2/3] overflow-hidden bg-surface-3">
        {!imgError ? (
          <img
            src={item.img}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl">
            🎬
          </div>
        )}

        {/* Score badge */}
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-md">
          ★ {item.score}
        </div>

        {/* Already in list indicator */}
        {existing && (
          <div className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm ${statusColor[existing.status] || "text-white/60"}`}>
            {existing.status === "Plan to Watch" ? "Planned" : existing.status}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="bg-accent text-surface text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {existing ? "Edit" : "+ Add"}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-sm font-medium text-white/90 leading-tight line-clamp-2 mb-1">
          {item.title}
        </p>
        <div className="flex items-center justify-between">
          <span className="badge badge-type">{item.type}</span>
          <span className="text-[11px] text-white/30">
            {item.episodes > 1
              ? `${item.episodes} ep`
              : item.episodes === 1
              ? "Film"
              : "Ongoing"}
          </span>
        </div>
        {item.genres?.length > 0 && (
          <p className="text-[10px] text-white/25 mt-1 truncate">
            {item.genres.slice(0, 2).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
