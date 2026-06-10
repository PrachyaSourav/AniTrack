import React from "react";
import { NavLink } from "react-router-dom";
import { useList } from "../context/ListContext";

export default function BottomNav() {
  const { list } = useList();
  const watching = list.filter((x) => x.status === "Watching").length;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t" style={{ background: "var(--bg2)", borderColor: "var(--border)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-14 px-2">
        {[
          { to: "/", end: true, icon: "🔍", label: "Discover" },
          { to: "/mylist", icon: "📋", label: "My List", badge: watching },
          { to: "/trending", icon: "🔥", label: "Trending" },
          { to: "/foryou", icon: "🎯", label: "For You" },
          { to: "/profile", icon: "👤", label: "Profile" },
        ].map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all relative ${isActive ? "text-accent" : ""}`} style={({ isActive }) => ({ color: isActive ? "var(--accent)" : "var(--text3)" })}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
            {item.badge > 0 && <span className="absolute top-1 right-1 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center" style={{ background: "var(--accent)", color: "var(--bg)" }}>{item.badge}</span>}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
