import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setMessage("");
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
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <span className="text-accent logo-glow">Ani</span>
            <span className="text-white">Track</span>
          </h1>
          <p className="text-white/40 text-sm">Track everything you watch & read</p>
        </div>

        {/* Card */}
        <div className="panel">
          {/* Tabs */}
          <div className="flex bg-surface-3 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); setMessage(""); }}
              className={`flex-1 text-sm py-2 rounded-md transition-all duration-150 font-medium ${
                mode === "login"
                  ? "bg-surface-2 text-white shadow"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
              className={`flex-1 text-sm py-2 rounded-md transition-all duration-150 font-medium ${
                mode === "signup"
                  ? "bg-surface-2 text-white shadow"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="section-label block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <div>
              <label className="section-label block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="input"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>

          {/* Error / success */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg text-accent text-sm">
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === "login" ? "Logging in..." : "Creating account..."}
              </>
            ) : (
              mode === "login" ? "Log in" : "Create account"
            )}
          </button>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Your list is saved securely in the cloud ☁️
        </p>
      </div>
    </div>
  );
}
