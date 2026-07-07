import { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { supabase } from "./supabaseClient";
import myLogo from "./Asset/SAS-logo.png";
import bgImage from "./Asset/admin-bg.png";

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── GAP 4: Brute-force lockout ──────────────────────────────
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);

  // Tick the lockout countdown every second
  useEffect(() => {
    if (!lockedUntil) return;
    const tick = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setLockCountdown(0);
        clearInterval(tick);
      } else {
        setLockCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [lockedUntil]);

  const isLocked = !!lockedUntil && Date.now() < lockedUntil;

  // ── GAP 5: Forgot-password mode ──────────────────────────────
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      resetEmail,
      { redirectTo: window.location.origin }
    );
    setResetLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setResetSent(true);
      setError(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockedUntil(Date.now() + 60_000);
        setError("Too many failed attempts. Please wait 60 seconds.");
      } else {
        setError(`${authError.message} (${5 - newAttempts} attempt${5 - newAttempts === 1 ? "" : "s"} remaining)`);
      }
      setIsLoading(false);
      return;
    }

    // Success — reset counters and unlock
    setAttempts(0);
    setLockedUntil(null);
    setIsLoading(false);
    onLogin();
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // These 4 lines add your Figma image!
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-card {
          position: relative; z-index: 10;
          background: linear-gradient(160deg, #162032 0%, #111827 60%, #0f1e31 100%);
          border: 1px solid rgba(34, 211, 238, 0.18);
          border-radius: 20px;
          padding: 44px 40px 36px;
          width: 100%;
          max-width: 460px;
          box-shadow:
            0 0 0 1px rgba(34,211,238,0.08),
            0 4px 6px rgba(0,0,0,0.3),
            0 20px 60px rgba(0,0,0,0.5),
            0 0 80px rgba(34,211,238,0.04);
          animation: cardIn 0.6s cubic-bezier(.22,.68,0,1.2) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .input-wrap {
          display: flex; align-items: center; gap: 12px;
          background: #e8edf5; border-radius: 999px;
          padding: 0 20px; height: 54px;
          border: 2px solid transparent;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .input-wrap.focused {
          border-color: rgba(34, 211, 238, 0.55);
          box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.1);
        }
        .input-wrap input {
          flex: 1; background: transparent; border: none; outline: none;
          font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 500;
          color: #1e3a5f; width: 100%;
        }
        .input-wrap input::placeholder { color: #7a90ab; font-weight: 400; }

        .btn-login {
          width: 100%; height: 56px; border-radius: 999px;
          border: 2px solid rgba(34, 211, 238, 0.7);
          background: linear-gradient(135deg, #1e3a5f 0%, #1a3050 100%);
          color: white; font-family: 'Outfit', sans-serif;
          font-size: 17px; font-weight: 800; letter-spacing: 0.1em;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          gap: 10px; transition: all 0.22s ease; position: relative; overflow: hidden;
        }
        .btn-login::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(34,211,238,0.08), transparent);
          opacity: 0; transition: opacity 0.2s ease;
        }
        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px); border-color: rgba(34, 211, 238, 0.95);
          box-shadow: 0 0 28px rgba(34, 211, 238, 0.25), 0 8px 24px rgba(0,0,0,0.3);
        }
        .btn-login:hover:not(:disabled)::before { opacity: 1; }
        .btn-login:active:not(:disabled) { transform: translateY(0); }
        .btn-login:disabled { opacity: 0.65; cursor: not-allowed; }

        .spinner {
          width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .btn-forgot {
          width: 100%; height: 48px; border-radius: 999px;
          border: 1.5px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.75); font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 600; letter-spacing: 0.04em;
          cursor: pointer; transition: all 0.2s ease;
        }
        .btn-forgot:hover {
          background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); color: white;
        }

        .btn-eye {
          background: none; border: none; cursor: pointer; padding: 0;
          display: flex; align-items: center; color: #7a90ab;
          transition: color 0.15s ease; flex-shrink: 0;
        }
        .btn-eye:hover { color: #1e3a5f; }

        .divider {
          height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          margin: 24px 0;
        }

        .stagger-1 { animation: slideUp 0.5s 0.1s cubic-bezier(.22,.68,0,1.2) both; }
        .stagger-2 { animation: slideUp 0.5s 0.2s cubic-bezier(.22,.68,0,1.2) both; }
        .stagger-3 { animation: slideUp 0.5s 0.3s cubic-bezier(.22,.68,0,1.2) both; }
        .stagger-4 { animation: slideUp 0.5s 0.4s cubic-bezier(.22,.68,0,1.2) both; }
        .stagger-5 { animation: slideUp 0.5s 0.5s cubic-bezier(.22,.68,0,1.2) both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Delete the ENTIRE <svg>...</svg> block that used to be here! */}
      {/* ── Login Card ── */}
      <div className="login-card" style={{ margin: "0 16px" }}>
        {/* Header */}
        <div
          className="stagger-1"
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          {/* Logo placeholder */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <img
              src={myLogo}
              alt="Admin Logo"
              style={{
                width: 72,
                height: 72,
                objectFit: "contain",
                /* Optional: Keep a tiny drop shadow to make it pop against the dark background */
                filter: "drop-shadow(0px 4px 12px rgba(34,211,238,0.2))",
              }}
            />
          </div>

          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "0.06em",
              lineHeight: 1,
            }}
          >
            <span style={{ color: "white" }}>LOGIN </span>
            <span style={{ color: "#22d3ee" }}>ADMIN</span>
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              fontWeight: 400,
              color: "rgba(148,163,184,0.85)",
              letterSpacing: "0.04em",
            }}
          >
            SASCHED · Admin
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Email */}
          <div className="stagger-2">
            <div
              className={`input-wrap ${focused === "email" ? "focused" : ""}`}
              onClick={() => document.getElementById("sas-email")?.focus()}
            >
              <User
                size={20}
                color="#1e3a8a"
                strokeWidth={2}
                style={{ flexShrink: 0 }}
              />
              <input
                id="sas-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="stagger-3">
            <div
              className={`input-wrap ${
                focused === "password" ? "focused" : ""
              }`}
              onClick={() => document.getElementById("sas-password")?.focus()}
            >
              <Lock
                size={20}
                color="#1e3a8a"
                strokeWidth={2}
                style={{ flexShrink: 0 }}
              />
              <input
                id="sas-password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="btn-eye"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPassword((s) => !s);
                }}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={2} />
                ) : (
                  <Eye size={18} strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {/* Error message — shown only when Supabase returns an error */}
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                style={{ flexShrink: 0 }}
              >
                <circle
                  cx="7.5"
                  cy="7.5"
                  r="7"
                  stroke="#f87171"
                  strokeWidth="1.4"
                />
                <path
                  d="M7.5 4.5v3.5"
                  stroke="#f87171"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <circle cx="7.5" cy="10.5" r="0.8" fill="#f87171" />
              </svg>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                  color: "#fca5a5",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {error}
              </span>
            </div>
          )}

          <div className="stagger-4" style={{ marginTop: 6 }}>
            <button
              type="submit"
              className="btn-login"
              disabled={isLoading || isLocked}
            >
              {isLocked ? (
                <>
                  <div className="spinner" />
                  <span>Locked — {lockCountdown}s</span>
                </>
              ) : isLoading ? (
                <>
                  <div className="spinner" /> <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <LogIn size={18} strokeWidth={2.5} /> <span>LOGIN</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="divider stagger-5" />

        {/* Forgot Password — GAP 5 fix: real reset flow */}
        <div className="stagger-5">
          {!showReset ? (
            <button
              type="button"
              className="btn-forgot"
              onClick={() => { setShowReset(true); setResetSent(false); setError(null); }}
            >
              Forgot Password
            </button>
          ) : resetSent ? (
            <div
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: 12,
                padding: "14px 16px",
                textAlign: "center",
                fontFamily: "'Outfit',sans-serif",
                fontSize: 13,
                color: "#86efac",
              }}
            >
              ✓ Check your inbox — a reset link has been sent.
              <button
                type="button"
                onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(""); }}
                style={{ display: "block", margin: "8px auto 0", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}
              >
                Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                className={`input-wrap ${focused === "reset-email" ? "focused" : ""}`}
                onClick={() => document.getElementById("reset-email")?.focus()}
              >
                <User size={20} color="#1e3a8a" strokeWidth={2} style={{ flexShrink: 0 }} />
                <input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your admin email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onFocus={() => setFocused("reset-email")}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn-forgot"
                  onClick={() => { setShowReset(false); setError(null); }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-login"
                  disabled={resetLoading || !resetEmail}
                  style={{ flex: 2, height: 48, fontSize: 14 }}
                >
                  {resetLoading ? <div className="spinner" /> : "Send Reset Link"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer note */}
        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11,
            color: "rgba(100,116,139,0.7)",
            letterSpacing: "0.03em",
          }}
        >
          Authorized personnel only · SAS v1.0
        </div>
      </div>
    </div>
  );
}
