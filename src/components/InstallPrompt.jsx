import React, { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Check if user dismissed before
    if (localStorage.getItem("anitrack_install_dismissed")) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      // Show prompt after 30 seconds
      setTimeout(() => setShow(true), 30000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setShow(false);
    setPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("anitrack_install_dismissed", "1");
  };

  if (!show || installed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 fade-up">
      <div className="panel border-accent/30 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#0d1a14" }}>
            <svg viewBox="0 0 48 48" width="36" height="36">
              <circle cx="24" cy="24" r="14" fill="none" stroke="#00C896" strokeWidth="2.5"/>
              <polygon points="20,16 20,32 34,24" fill="#00C896"/>
              <polyline points="17,24 22,30 31,18" fill="none" stroke="#0d1a14" strokeWidth="4"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Install AniTrack
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text3)" }}>
              Add to your home screen for quick access — works offline too!
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={handleInstall} className="btn-primary text-xs px-4 py-2">
                Install
              </button>
              <button onClick={handleDismiss} className="btn-ghost text-xs px-4 py-2">
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
