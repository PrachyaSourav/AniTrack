import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";

const TYPE_ICONS = { friend_request: "👤", friend_accepted: "🤝", episode: "📺", system: "📣" };

export default function NotificationsPanel() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen((v) => !v); if (open) markAllRead(); }} className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all" style={{ color: "var(--text3)" }}>
        🔔
        {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center" style={{ background: "var(--accent)", color: "var(--bg)" }}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 border rounded-xl shadow-2xl z-50 overflow-hidden fade-up" style={{ background: "var(--bg2)", borderColor: "var(--border2)" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Notifications</p>
            {unreadCount > 0 && <button onClick={markAllRead} className="text-xs" style={{ color: "var(--accent)" }}>Mark all read</button>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8" style={{ color: "var(--text3)" }}><p className="text-2xl mb-2">🔔</p><p className="text-xs">No notifications yet</p></div>
            ) : notifications.map((n) => (
              <div key={n.id} onClick={() => markRead(n.id)} className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b transition-colors ${!n.read ? "bg-accent/5" : ""}`} style={{ borderColor: "var(--border)" }}>
                <span className="text-lg flex-shrink-0">{TYPE_ICONS[n.type] || "📣"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{n.title}</p>
                  {n.message && <p className="text-xs mt-0.5" style={{ color: "var(--text3)" }}>{n.message}</p>}
                  <p className="text-[10px] mt-1" style={{ color: "var(--text3)" }}>{formatTime(n.created_at)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: "var(--accent)" }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
