import React, { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("anitrack_install_dismissed")) return;
    const handler = (e) => { e.preventDefault(); setPrompt(e); setTimeout(() => setShow(true), 30000); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setShow(false);
    setPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 fade-up">
      <div className="panel border-accent/30 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#0d1a14" }}>
            <span className="text-2xl">🎌</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Install AniTrack</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text3)" }}>Add to home screen for quick access!</p>
            <div className="flex gap-2 mt-3">
              <button onClick={handleInstall} className="btn-primary text-xs px-4 py-2">Install</button>
              <button onClick={() => { setShow(false); localStorage.setItem("anitrack_install_dismissed", "1"); }} className="btn-ghost text-xs px-4 py-2">Not now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
