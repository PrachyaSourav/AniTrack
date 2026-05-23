import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useList } from "../context/ListContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { list } = useList();
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const watching = list.filter(x => x.status === "Watching").length;
  const avatar = user?.email?.[0]?.toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2">
        <NavLink to="/" className="flex items-center gap-1.5 mr-4 flex-shrink-0">
          <span className="text-xl font-bold text-accent logo-glow tracking-tight" style={{fontFamily:"'Syne',sans-serif"}}>Ani</span>
          <span className="text-xl font-bold text-white tracking-tight" style={{fontFamily:"'Syne',sans-serif"}}>Track</span>
        </NavLink>
        <div className="flex items-center gap-1 flex-1">
          <NavLink to="/" end className={({isActive})=>`nav-tab ${isActive?"active":""}`}>Discover</NavLink>
          <NavLink to="/trending" className={({isActive})=>`nav-tab flex items-center gap-1 ${isActive?"active":""}`}>🔥 Trending</NavLink>
          <NavLink to="/mylist" className={({isActive})=>`nav-tab flex items-center gap-2 ${isActive?"active":""}`}>
            My List
            {watching > 0 && <span className="bg-accent text-surface text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{watching}</span>}
          </NavLink>
          <NavLink to="/dashboard" className={({isActive})=>`nav-tab ${isActive?"active":""}`}>Dashboard</NavLink>
        </div>
        <div className="relative">
          <button onClick={()=>setShowMenu(v=>!v)} className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold hover:bg-accent/30 transition-all">
            {avatar}
          </button>
          {showMenu && <>
            <div className="absolute right-0 top-10 w-52 bg-surface-2 border border-border rounded-xl shadow-xl z-50 overflow-hidden fade-up">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs text-white/40">Signed in as</p>
                <p className="text-sm text-white/80 truncate font-medium">{user?.email}</p>
              </div>
              <NavLink to="/profile" onClick={()=>setShowMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">Profile & Roadmap</NavLink>
              <button onClick={()=>{signOut();setShowMenu(false);}} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all">Sign out</button>
            </div>
            <div className="fixed inset-0 z-40" onClick={()=>setShowMenu(false)}/>
          </>}
        </div>
      </div>
    </nav>
  );
}
