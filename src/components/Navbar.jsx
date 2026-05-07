import React from "react";
import { NavLink } from "react-router-dom";
import { useList } from "../context/ListContext";

export default function Navbar() {
  const { list } = useList();
  const watching = list.filter((x) => x.status === "Watching").length;

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-1.5 mr-4 flex-shrink-0">
          <span
            className="font-display text-xl font-bold text-accent logo-glow tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Ani
          </span>
          <span
            className="font-display text-xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Track
          </span>
        </NavLink>

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-tab ${isActive ? "active" : ""}`
            }
          >
            Discover
          </NavLink>
          <NavLink
            to="/mylist"
            className={({ isActive }) =>
              `nav-tab flex items-center gap-2 ${isActive ? "active" : ""}`
            }
          >
            My List
            {watching > 0 && (
              <span className="bg-accent text-surface text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {watching}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-tab ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>
        </div>

        {/* Profile avatar */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-150 ${
              isActive
                ? "bg-accent text-surface"
                : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white"
            }`
          }
        >
          U
        </NavLink>
      </div>
    </nav>
  );
}
