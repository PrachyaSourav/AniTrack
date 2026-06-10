import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setMessage("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await signUp(email, password);
      if (error) setError(error.message);
      else setMessage("Account created! Check your email to confirm, then log in.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm fade-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            <span className="logo-glow" style={{ color: "var(--accent)" }}>Ani</span>
            <span style={{ color: "var(--text)" }}>Track</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--text3)" }}>Track everything you watch & read</p>
        </div>
        <div className="panel">
          <div className="flex rounded-lg p-1 mb-6" style={{ background: "var(--bg3)" }}>
            {["login","signup"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); setMessage(""); }}
                className="flex-1 text-sm py-2 rounded-md transition-all font-medium"
                style={{ background: mode === m ? "var(--bg2)" : "transparent", color: mode === m ? "var(--text)" : "var(--text3)" }}>
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="section-label block mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            </div>
            <div>
              <label className="section-label block mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className="input" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            </div>
          </div>
          {error && <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: "#ef444420", color: "#f87171", border: "1px solid #ef444430" }}>{error}</div>}
          {message && <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)", color: "var(--accent)", border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)" }}>{message}</div>}
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{mode === "login" ? "Logging in..." : "Creating..."}</> : mode === "login" ? "Log in" : "Create account"}
          </button>
        </div>
        <p className="text-center text-xs mt-6" style={{ color: "var(--text3)" }}>Your list is saved securely in the cloud ☁️</p>
      </div>
    </div>
  );
}
