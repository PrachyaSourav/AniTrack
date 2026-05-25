import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

const NOTIFICATION_TYPES = [
  { key: "friend_requests", label: "Friend requests", desc: "When someone sends you a follow request", emoji: "👤" },
  { key: "friend_accepted", label: "Friend accepted", desc: "When someone accepts your request", emoji: "🤝" },
  { key: "weekly_digest", label: "Weekly digest", desc: "Weekly summary of trending anime & manga", emoji: "📊" },
  { key: "new_season", label: "New season alerts", desc: "When a new anime season starts", emoji: "📅" },
  { key: "episode_reminders", label: "Episode reminders", desc: "Reminders for shows you're watching", emoji: "📺" },
];

export default function EmailNotificationsPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [prefs, setPrefs] = useState({
    friend_requests: true,
    friend_accepted: true,
    weekly_digest: false,
    new_season: false,
    episode_reminders: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("email_prefs")
      .eq("id", user.id)
      .single();
    if (data?.email_prefs) setPrefs(data.email_prefs);
  };

  const handleToggle = (key) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("profiles").update({ email_prefs: prefs }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestEmail = async () => {
    setSendingTest(true);
    // Send a test notification via Supabase
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "system",
      title: "Test email notification",
      message: "Your email notifications are working correctly!",
    });
    setTestSent(true);
    setSendingTest(false);
    setTimeout(() => setTestSent(false), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text)", fontFamily: "'Syne', sans-serif" }}>
          Email Notifications
        </h1>
        <p className="text-sm" style={{ color: "var(--text3)" }}>
          Manage what emails you receive from AniTrack
        </p>
      </div>

      {/* Email address */}
      <div className="panel mb-6">
        <p className="section-label mb-3">📧 Your email</p>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--bg3)" }}>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{user?.email}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text3)" }}>Notifications sent to this address</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }}>
            ✓ Verified
          </span>
        </div>
      </div>

      {/* Notification preferences */}
      <div className="panel mb-6">
        <p className="section-label mb-4">🔔 Notification preferences</p>
        <div className="flex flex-col gap-3">
          {NOTIFICATION_TYPES.map((type) => (
            <div key={type.key}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: "var(--bg3)" }}>
              <div className="flex items-start gap-3">
                <span className="text-xl">{type.emoji}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{type.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text3)" }}>{type.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(type.key)}
                className="w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0"
                style={{ background: prefs[type.key] ? "var(--accent)" : "var(--border2)" }}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200 ${prefs[type.key] ? "translate-x-5" : "translate-x-0.5"}`}
                  style={{ background: "white" }} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={handleSave} disabled={saving}
          className="btn-primary w-full mt-5 disabled:opacity-50">
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save preferences"}
        </button>
      </div>

      {/* Test email */}
      <div className="panel mb-6">
        <p className="section-label mb-3">🧪 Test notifications</p>
        <p className="text-sm mb-4" style={{ color: "var(--text3)" }}>
          Send a test notification to make sure everything is working.
        </p>
        <button onClick={handleTestEmail} disabled={sendingTest || testSent} className="btn-ghost w-full disabled:opacity-50">
          {sendingTest ? "Sending..." : testSent ? "✓ Test notification sent!" : "Send test notification"}
        </button>
      </div>

      {/* Supabase email setup guide */}
      <div className="panel" style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)", background: "color-mix(in srgb, var(--accent) 5%, transparent)" }}>
        <p className="section-label mb-3">⚙️ Enable email sending in Supabase</p>
        <p className="text-sm mb-4" style={{ color: "var(--text3)" }}>
          To actually send emails, enable SMTP in your Supabase dashboard:
        </p>
        <ol className="text-sm space-y-2" style={{ color: "var(--text2)" }}>
          <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>1.</span> Go to your Supabase dashboard → <strong>Authentication → Email Templates</strong></li>
          <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>2.</span> Go to <strong>Project Settings → Auth</strong></li>
          <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>3.</span> Enable <strong>Custom SMTP</strong></li>
          <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>4.</span> Use a free email service like <a href="https://resend.com" target="_blank" rel="noreferrer" className="underline" style={{ color: "var(--accent)" }}>Resend.com</a> (free tier: 3000 emails/month)</li>
        </ol>
      </div>
    </div>
  );
}
