import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useList } from "../context/ListContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import NotificationsPanel from "./NotificationsPanel";

export default function Navbar() {
  const { list } = useList();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const watching = list.filter((x) => x.status === "Watching").length;
  const avatar = (profile?.display_name || user?.email || "U")[0].toUpperCase();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-1">
        <NavLink to="/" className="flex items-center gap-1.5 mr-3 flex-shrink-0">
          <span className="text-xl font-bold logo-glow tracking-tight" style={{ color: "var(--accent)", fontFamily: "'Syne', sans-serif" }}>Ani</span>
          <span className="text-xl font-bold tracking-tight" style={{ color: "var(--text)", fontFamily: "'Syne', sans-serif" }}>Track</span>
        </NavLink>
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none">
          <NavLink to="/" end className={({ isActive }) => `nav-tab flex-shrink-0 ${isActive ? "active" : ""}`}>Discover</NavLink>
          <NavLink to="/mylist" className={({ isActive }) => `nav-tab flex-shrink-0 flex items-center gap-1.5 ${isActive ? "active" : ""}`}>
            My List
            {watching > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none" style={{ background: "var(--accent)", color: "var(--bg)" }}>{watching}</span>}
          </NavLink>
          <NavLink to="/trending" className={({ isActive }) => `nav-tab flex-shrink-0 ${isActive ? "active" : ""}`}>🔥</NavLink>
          <NavLink to="/foryou" className={({ isActive }) => `nav-tab flex-shrink-0 ${isActive ? "active" : ""}`}>🎯 For You</NavLink>
          <NavLink to="/social" className={({ isActive }) => `nav-tab flex-shrink-0 ${isActive ? "active" : ""}`}>👥 Social</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-tab flex-shrink-0 ${isActive ? "active" : ""}`}>Dashboard</NavLink>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={toggleTheme} className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-white/10 transition-all" style={{ color: "var(--text3)" }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <NotificationsPanel />
          <div className="relative">
            <button onClick={() => setShowMenu((v) => !v)} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all" style={{ background: (profile?.avatar_color || "#00C896") + "33", color: profile?.avatar_color || "#00C896", fontFamily: "'Syne', sans-serif" }}>
              {avatar}
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 w-52 border rounded-xl shadow-xl z-50 overflow-hidden fade-up" style={{ background: "var(--bg2)", borderColor: "var(--border2)" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                  <p className="text-xs" style={{ color: "var(--text3)" }}>Signed in as</p>
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{profile?.display_name || user?.email}</p>
                  {profile?.username && <p className="text-xs" style={{ color: "var(--accent)" }}>@{profile.username}</p>}
                </div>
                <NavLink to="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm transition-all hover:bg-white/5" style={{ color: "var(--text2)" }}>Profile & Settings</NavLink>
                <NavLink to="/import" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm transition-all hover:bg-white/5" style={{ color: "var(--text2)" }}>Import from MAL/AniList</NavLink>
                <button onClick={() => { signOut(); setShowMenu(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm transition-all hover:bg-red-500/10" style={{ color: "#f87171" }}>Sign out</button>
              </div>
            )}
            {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}
          </div>
        </div>
      </div>
    </nav>
  );
}
