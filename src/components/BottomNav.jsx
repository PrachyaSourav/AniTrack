import React from "react";
import { NavLink } from "react-router-dom";
import { useList } from "../context/ListContext";

export default function BottomNav() {
  const { list } = useList();
  const watching = list.filter((x) => x.status === "Watching").length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t"
      style={{ background: "var(--bg2)", borderColor: "var(--border)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-14 px-2">
        <NavLink to="/" end className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive ? "text-accent" : ""}`}
          style={{ color: "var(--text3)" }}>
          <span className="text-lg">🔍</span>
          <span className="text-[10px]">Discover</span>
        </NavLink>
        <NavLink to="/mylist" className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all relative ${isActive ? "text-accent" : ""}`}
          style={{ color: "var(--text3)" }}>
          <span className="text-lg">📋</span>
          <span className="text-[10px]">My List</span>
          {watching > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-surface text-[9px] font-bold rounded-full flex items-center justify-center"
              style={{ color: "var(--bg)" }}>
              {watching}
            </span>
          )}
        </NavLink>
        <NavLink to="/trending" className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive ? "text-accent" : ""}`}
          style={{ color: "var(--text3)" }}>
          <span className="text-lg">🔥</span>
          <span className="text-[10px]">Trending</span>
        </NavLink>
        <NavLink to="/foryou" className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive ? "text-accent" : ""}`}
          style={{ color: "var(--text3)" }}>
          <span className="text-lg">🎯</span>
          <span className="text-[10px]">For You</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive ? "text-accent" : ""}`}
          style={{ color: "var(--text3)" }}>
          <span className="text-lg">👤</span>
          <span className="text-[10px]">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
