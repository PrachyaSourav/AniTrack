import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useList } from "../context/ListContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import NotificationsPanel from "./NotificationsPanel";

export default function Navbar() {
  const { list } = useList();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [showMenu, setShowMenu] = useState(false);
  const watching = list.filter((x) => x.status === "Watching").length;
  const avatar = (profile?.display_name || user?.email || "U")[0].toUpperCase();

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-1">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-1.5 mr-3 flex-shrink-0">
          <span className="font-display text-xl font-bold text-accent logo-glow tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Ani</span>
          <span className="font-display text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Track</span>
        </NavLink>

        {/* Nav links */}
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none">
          <NavLink to="/" end className={({ isActive }) => `nav-tab flex-shrink-0 ${isActive ? "active" : ""}`}>Discover</NavLink>
          <NavLink to="/mylist" className={({ isActive }) => `nav-tab flex-shrink-0 flex items-center gap-1.5 ${isActive ? "active" : ""}`}>
            My List
            {watching > 0 && <span className="bg-accent text-surface text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{watching}</span>}
          </NavLink>
          <NavLink to="/trending" className={({ isActive }) => `nav-tab flex-shrink-0 ${isActive ? "active" : ""}`}>🔥</NavLink>
          <NavLink to="/foryou" className={({ isActive }) => `nav-tab flex-shrink-0 ${isActive ? "active" : ""}`}>🎯 For You</NavLink>
          <NavLink to="/social" className={({ isActive }) => `nav-tab flex-shrink-0 ${isActive ? "active" : ""}`}>👥 Social</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-tab flex-shrink-0 ${isActive ? "active" : ""}`}>Dashboard</NavLink>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <NotificationsPanel />

          {/* Profile dropdown */}
          <div className="relative">
            <button onClick={() => setShowMenu((v) => !v)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-150"
              style={{ background: (profile?.avatar_color || "#00C896") + "33", color: profile?.avatar_color || "#00C896", fontFamily: "'Syne', sans-serif" }}>
              {avatar}
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 w-52 bg-surface-2 border border-border rounded-xl shadow-xl z-50 overflow-hidden fade-up">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs text-white/40">Signed in as</p>
                  <p className="text-sm text-white/80 truncate font-medium">{profile?.display_name || user?.email}</p>
                  {profile?.username && <p className="text-xs text-accent/60">@{profile.username}</p>}
                </div>
                <NavLink to="/profile" onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
                  Profile & Settings
                </NavLink>
                <NavLink to="/import" onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
                  Import from MAL/AniList
                </NavLink>
                <button onClick={() => { signOut(); setShowMenu(false); }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                  Sign out
                </button>
              </div>
            )}
            {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}
          </div>
        </div>
      </div>
    </nav>
  );
}
