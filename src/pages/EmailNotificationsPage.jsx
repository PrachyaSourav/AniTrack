import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useAuth } from "../context/AuthContext";

const NOTIFICATION_TYPES = [
  { key: "friend_requests", label: "Friend requests", desc: "When someone sends you a follow request", emoji: "👤" },
  { key: "friend_accepted", label: "Friend accepted", desc: "When someone accepts your request", emoji: "🤝" },
  { key: "weekly_digest", label: "Weekly digest", desc: "Weekly summary of trending anime", emoji: "📊" },
  { key: "new_season", label: "New season alerts", desc: "When a new anime season starts", emoji: "📅" },
  { key: "episode_reminders", label: "Episode reminders", desc: "Reminders for shows you're watching", emoji: "📺" },
];

export default function EmailNotificationsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState({ friend_requests: true, friend_accepted: true, weekly_digest: false, new_season: false, episode_reminders: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("profiles").select("email_prefs").eq("id", user.id).single()
      .then(({ data }) => { if (data?.email_prefs) setPrefs(data.email_prefs); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("profiles").update({ email_prefs: prefs }).eq("id", user.id);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8"><h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Email Notifications</h1><p className="text-white/40 text-sm">Manage what emails you receive</p></div>
      <div className="panel mb-6"><p className="section-label mb-3">📧 Your email</p>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-3"><div className="flex-1"><p className="text-sm font-medium text-white">{user?.email}</p></div><span className="text-xs px-2 py-1 rounded-full bg-accent/15 text-accent">✓ Verified</span></div>
      </div>
      <div className="panel mb-6"><p className="section-label mb-4">🔔 Preferences</p>
        <div className="flex flex-col gap-3">
          {NOTIFICATION_TYPES.map((type) => (
            <div key={type.key} className="flex items-center justify-between p-3 rounded-xl bg-surface-3">
              <div className="flex items-start gap-3"><span className="text-xl">{type.emoji}</span><div><p className="text-sm font-medium text-white/90">{type.label}</p><p className="text-xs text-white/40">{type.desc}</p></div></div>
              <button onClick={() => setPrefs((p) => ({ ...p, [type.key]: !p[type.key] }))} className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${prefs[type.key] ? "bg-accent" : "bg-white/20"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${prefs[type.key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-5 disabled:opacity-50">{saving ? "Saving..." : saved ? "✓ Saved!" : "Save preferences"}</button>
      </div>
    </div>
  );
}
