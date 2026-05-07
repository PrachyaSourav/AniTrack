import React, { useState } from "react";

const STATUS_BADGE = {
  Watching: "badge-watching",
  Completed: "badge-completed",
  Dropped: "badge-dropped",
  "Plan to Watch": "badge-plan",
  "On Hold": "badge-hold",
};

export default function ListItem({ item, onEdit }) {
  const [imgError, setImgError] = useState(false);

  const progressPct =
    item.total > 0
      ? Math.min(100, Math.round((item.progress / item.total) * 100))
      : item.status === "Completed"
      ? 100
      : 0;

  const progressLabel =
    item.total > 0
      ? `${item.progress} / ${item.total}`
      : item.progress > 0
      ? `${item.progress} ep`
      : "Not started";

  return (
    <div
      className="flex items-start gap-4 p-4 bg-surface-2 border border-border rounded-xl hover:border-border-hover transition-all duration-150 group cursor-pointer"
      onClick={onEdit}
    >
      {/* Cover */}
      <div className="w-12 h-[68px] rounded-lg overflow-hidden bg-surface-3 flex-shrink-0">
        {!imgError ? (
          <img
            src={item.img}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            🎬
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white/90 text-sm leading-tight truncate group-hover:text-white transition-colors">
          {item.title}
        </p>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`badge ${STATUS_BADGE[item.status] || "badge-plan"}`}>
            {item.status}
          </span>
          <span className="badge badge-type">{item.type}</span>
          {item.rating > 0 && (
            <span className="text-xs text-yellow-400 font-medium">★ {item.rating}</span>
          )}
        </div>

        {/* Progress */}
        <div className="mt-2 flex items-center gap-2">
          <div className="progress-bar flex-1">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-[11px] text-white/30 flex-shrink-0 tabular-nums">
            {progressLabel}
          </span>
        </div>

        {/* Note */}
        {item.note && (
          <p className="text-xs text-white/30 italic mt-1.5 truncate">"{item.note}"</p>
        )}
      </div>

      {/* Edit hint */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white/30 flex-shrink-0 pt-0.5">
        Edit →
      </div>
    </div>
  );
}
