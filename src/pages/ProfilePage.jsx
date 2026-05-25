import React, { useState } from "react";
import { useList } from "../context/ListContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useNavigate } from "react-router-dom";

const AVATAR_COLORS = ["#00C896", "#6366f1", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#8b5cf6", "#f97316"];

function PhaseCard({ phase, done, title, items }) {
  return (
    <div className={`p-4 rounded-xl border ${done ? "border-accent/30 bg-accent/5" : "border-border bg-surface-2"}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${done ? "bg-accent/20 text-accent" : "bg-white/10 text-white/40"}`}>
          Phase {phase}
        </span>
        <span className={`text-xs font-semibold ${done ? "text-accent" : "text-white/60"}`}>{done ? "✓ Complete" : "Coming up"}</span>
      </div>
      <p className="text-sm font-medium text-white/80 mb-2">{title}</p>
      <ul className="text-xs text-white/40 space-y-1">{items.map((i) => <li key={i}>• {i}</li>)}</ul>
    </div>
  );
}

export default function ProfilePage() {
  const { list } = useList();
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const avatar = (profile?.display_name || user?.email || "U")[0].toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    const { error } = await updateProfile({ display_name: displayName, username: username.toLowerCase().replace(/[^a-z0-9_]/g, ""), avatar_color: profile?.avatar_color });
    if (error) setError(error.message);
    else { setSuccess("Profile updated!"); setEditing(false); }
    setSaving(false);
  };

  const handleColorChange = async (color) => {
    await updateProfile({ avatar_color: color });
  };

  const handleTogglePublic = async () => {
    await updateProfile({ list_public: !profile?.list_public });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Profile</h1>
      </div>

      {/* Profile card */}
      <div className="panel flex items-start gap-5 mb-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: (profile?.avatar_color || "#00C896") + "33", color: profile?.avatar_color || "#00C896", fontFamily: "'Syne', sans-serif" }}>
            {avatar}
          </div>
          {/* Color picker */}
          <div className="flex gap-1.5 flex-wrap justify-center w-20">
            {AVATAR_COLORS.map((c) => (
              <button key={c} onClick={() => handleColorChange(c)}
                className={`w-5 h-5 rounded-full transition-transform ${profile?.avatar_color === c ? "scale-125 ring-2 ring-white/30" : "hover:scale-110"}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="section-label block mb-1.5">Display name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="section-label block mb-1.5">Username</label>
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-sm">@</span>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input flex-1" />
                </div>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              {success && <p className="text-xs text-accent">{success}</p>}
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? "Saving..." : "Save"}</button>
                <button onClick={() => setEditing(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-white text-lg">{profile?.display_name || user?.email}</p>
              {profile?.username && <p className="text-sm text-accent/60 mt-0.5">@{profile.username}</p>}
              <p className="text-sm text-white/40 mt-1">{user?.email}</p>
              <p className="text-xs text-white/25 mt-1">Tracking {list.length} item{list.length !== 1 ? "s" : ""}</p>
              <button onClick={() => { setEditing(true); setDisplayName(profile?.display_name || ""); setUsername(profile?.username || ""); }}
                className="btn-ghost text-xs mt-3">Edit Profile</button>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="panel mb-6">
        <p className="section-label mb-4">⚙️ Settings</p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 bg-surface-3 rounded-xl">
            <div>
              <p className="text-sm font-medium text-white/90">Public list</p>
              <p className="text-xs text-white/40">Allow others to view your list</p>
            </div>
            <button onClick={handleTogglePublic}
              className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${profile?.list_public ? "bg-accent" : "bg-white/20"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${profile?.list_public ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <button onClick={() => navigate("/import")}
            className="flex items-center justify-between p-3 bg-surface-3 rounded-xl hover:bg-white/5 transition-colors text-left">
            <div>
              <p className="text-sm font-medium text-white/90">Import from MAL / AniList</p>
              <p className="text-xs text-white/40">Bring your existing list over</p>
            </div>
            <span className="text-white/30">→</span>
          </button>
          <button onClick={() => navigate("/social")}
            className="flex items-center justify-between p-3 bg-surface-3 rounded-xl hover:bg-white/5 transition-colors text-left">
            <div>
              <p className="text-sm font-medium text-white/90">Share my list</p>
              <p className="text-xs text-white/40">Get your shareable link</p>
            </div>
            <span className="text-white/30">→</span>
          </button>
          <button onClick={() => navigate("/notifications/email")}
            className="flex items-center justify-between p-3 bg-surface-3 rounded-xl hover:bg-white/5 transition-colors text-left">
            <div>
              <p className="text-sm font-medium text-white/90">Email notifications</p>
              <p className="text-xs text-white/40">Manage what emails you receive</p>
            </div>
            <span className="text-white/30">→</span>
          </button>
        </div>
      </div>

      {/* Roadmap */}
      <p className="section-label mb-4">Build roadmap</p>
      <div className="grid sm:grid-cols-2 gap-4 stagger">
        <PhaseCard phase={1} done title="Frontend UI" items={["React + Tailwind", "All pages", "Local storage"]} />
        <PhaseCard phase={2} done title="Auth + Database" items={["Supabase login", "Cloud sync", "User profiles"]} />
        <PhaseCard phase={3} done title="Live APIs" items={["Jikan (anime/manga)", "OMDB (movies/shows)", "Real covers"]} />
        <PhaseCard phase={4} done title="Deployed on Vercel" items={["Live at ani-track-plum.vercel.app", "Auto-deploy on push"]} />
        <PhaseCard phase={5} done title="Social + Recommendations" items={["Friend system", "Share list", "For You page", "Import MAL/AniList", "Notifications"]} />
      </div>

      <div className="panel mt-6">
        <p className="section-label mb-3">Tech stack</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "React 18", role: "UI", icon: "⚛️" },
            { name: "Tailwind CSS", role: "Styling", icon: "🎨" },
            { name: "Supabase", role: "Auth + DB", icon: "🔥" },
            { name: "Vercel", role: "Hosting", icon: "▲" },
          ].map((t) => (
            <div key={t.name} className="bg-surface-3 rounded-lg p-3">
              <p className="text-xl mb-1">{t.icon}</p>
              <p className="text-sm font-medium text-white/80">{t.name}</p>
              <p className="text-xs text-white/30">{t.role}</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={signOut} className="btn-danger w-full mt-6">Sign out</button>
    </div>
  );
}
