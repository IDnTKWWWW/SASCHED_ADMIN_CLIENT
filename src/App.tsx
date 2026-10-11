// Bug 1 fix: removed @ts-nocheck — all type errors corrected below
import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import AdminLogin from "./AdminLogin";
import {
  LayoutDashboard,
  Users,
  History,
  Settings,
  ChevronRight,
  LogOut,
  UserPlus,
  SkipForward,
  RotateCcw,
  PauseCircle,
  PlayCircle,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  ChevronDown,
  Trash2,
  ZapOff,
  Zap,
  ShieldAlert,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  BarChart2,
  AlertOctagon,
  MinusCircle,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  User,
  KeyRound,
  ShieldCheck,
  Sliders,
  CheckCheck,
  RotateCw,
  Cpu,
  DoorOpen,
  DoorClosed,
  Scissors,
  FileDown,
  Trash2 as TrashIcon,
  Printer,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";

// ─── PURPOSE OPTIONS ─────────────────────────────────────────────────────────
const PURPOSE_OPTIONS = ["General", "Premium Support", "Consultation", "Billing"];
const TERTIARY_PROGRAMS = ["Premium Support", "Consultation", "Billing"];

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────
interface QueueItem {
  ticket: string;
  name: string;
  service_type: string;
  time: string;
  type: string;
  eta: number;
  calledAt: string | null;
  department: string;
  id?: string;
}
interface HistoryItem {
  ticket?: string;
  ticket_number?: string;
  name?: string;
  user_name?: string;
  service_type: string;
  status: string;
  time?: string;
  appointment_time?: string;
  duration?: string;
  department?: string;
  walkin?: boolean;
  id?: string;
  created_at?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
const getLocalTodayDateStr = () => {
  const now = new Date();
  const yr = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const dy = String(now.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${dy}`;
};

const getNowTimeStr = () => {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const isTodayAppointment = (appointmentTime?: string) => {
  if (!appointmentTime) return true;
  if (!appointmentTime.includes("T")) return true;
  const datePart = appointmentTime.split("T")[0];
  return datePart <= getLocalTodayDateStr();
};

let sharedAudioCtx: AudioContext | null = null;
const getSharedAudioCtx = (): AudioContext | null => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (_) {
    return null;
  }
};

const playChime = (type: "call" | "alert" | "complete") => {
  try {
    const ctx = getSharedAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (type === "call") {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.15); // E5
      osc2.frequency.setValueAtTime(1046.5, now); // C6
      osc2.frequency.setValueAtTime(1318.5, now + 0.15); // E6
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.8);
      osc2.stop(now + 0.8);
    } else if (type === "alert") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.18);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === "complete") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (_) {}
};



// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
  .fade-in { animation: fadeIn 0.35s ease forwards; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
  .flash-enter { animation: flashIn 0.5s ease; }
  @keyframes flashIn { 0%,100%{opacity:1;}50%{opacity:0.4;} }
  .ping-ring { animation: pingRing 1s ease-out; }
  @keyframes pingRing { 0%{box-shadow:0 0 0 0 rgba(251,191,36,0.6);}100%{box-shadow:0 0 0 24px rgba(251,191,36,0);} }
  .noshow-pulse { animation: noshowPulse 1.2s ease-in-out infinite; }
  @keyframes noshowPulse { 0%,100%{opacity:1;}50%{opacity:0.6;} }
  .slide-in { animation: slideIn 0.4s cubic-bezier(.22,.68,0,1.2) forwards; }
  @keyframes slideIn { from{opacity:0;transform:scale(0.92);}to{opacity:1;transform:scale(1);} }
  .row-remove { animation: rowRemove 0.35s ease forwards; }
  @keyframes rowRemove { to{opacity:0;transform:translateX(12px);} }
  .nav-btn { transition:all 0.18s ease; cursor:pointer; border:none; background:transparent; width:100%; text-align:left; }
  .nav-btn:hover { background:rgba(255,255,255,0.06) !important; }
  .ctrl-btn { transition:all 0.18s ease; cursor:pointer; }
  .ctrl-btn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
  .ctrl-btn:disabled { opacity:0.4; cursor:not-allowed; }
  .stat-card { transition:transform 0.18s ease; }
  .stat-card:hover { transform:translateY(-2px); }
  .modal-backdrop { animation:backdropIn 0.25s ease; }
  @keyframes backdropIn { from{opacity:0;}to{opacity:1;} }
  input,select { outline:none; transition:all 0.2s ease; }
  input:focus,select:focus { box-shadow:0 0 0 2px var(--focus-ring, rgba(59,130,246,0.4)); }
  .grace-ring { transform-origin:center; transform:rotate(-90deg); transition:stroke-dashoffset 1s linear; }
  .queue-row { transition:background 0.15s ease; }
  .queue-row:hover { background:rgba(255,255,255,0.03) !important; }
  .queue-row:hover .rm-btn { opacity:1 !important; }
  .rm-btn { opacity:0; transition:opacity 0.15s ease; }
  .lq-row { transition:background 0.15s ease; }
  .lq-row:hover { background:var(--hover-glow, rgba(59,130,246,0.05)) !important; }
  .lq-row:hover .lq-rm { opacity:1 !important; }
  .lq-rm { opacity:0; transition:opacity 0.15s ease; }
  .filter-sel { appearance:none; cursor:pointer; }
  .toggle-track { transition:background 0.25s ease; cursor:pointer; }
  .toggle-thumb { transition:transform 0.25s cubic-bezier(.22,.68,0,1.4), background 0.2s ease; }
  .settings-row { transition:background 0.15s ease; border-radius:12px; }
  .settings-row:hover { background:rgba(255,255,255,0.03); }
  .save-toast { animation:toastIn 0.35s cubic-bezier(.22,.68,0,1.2) forwards; }
  @keyframes toastIn { from{opacity:0;transform:translateY(8px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);} }
  .win-opt-btn { transition: all 0.2s cubic-bezier(.22,.68,0,1.2); cursor: pointer; }
  .win-opt-btn:hover:not(.active) { background: rgba(255,255,255,0.06) !important; color: rgba(255,255,255,0.85) !important; transform: translateY(-1px); }
  .win-opt-btn:active { transform: translateY(1px); }
  @keyframes beaconRadar { 0%{transform:scale(1);opacity:0.85;} 50%{opacity:0.4;} 100%{transform:scale(2.7);opacity:0;} }
  @keyframes statusDotPulse { 0%,100%{transform:scale(1);opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,0.7);} 50%{transform:scale(1.15);opacity:0.85;box-shadow:0 0 0 4px rgba(34,197,94,0);} }
  @keyframes statusAmberBreathe { 0%,100%{transform:scale(1);opacity:1;box-shadow:0 0 0 0 rgba(245,158,11,0.7);} 50%{transform:scale(1.15);opacity:0.85;box-shadow:0 0 0 4px rgba(245,158,11,0);} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media print {
    body * { visibility: hidden !important; }
    #printable-slip, #printable-slip * { visibility: visible !important; }
    #printable-slip { position: fixed !important; left: 0 !important; top: 0 !important; width: 100vw !important; height: auto !important; background: white !important; color: black !important; padding: 20px !important; }
  }
  @media (max-width: 1024px), (max-height: 768px) {
    body, #root { overflow: auto !important; height: auto !important; }
  }
`;

// ─── SMALL ATOMS ─────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  const isWalk = type === "walkin";
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 99,
        padding: "3px 9px",
        background: isWalk ? "rgba(251,191,36,0.12)" : "rgba(59,130,246,0.12)",
        color: isWalk ? "#fbbf24" : "#60a5fa",
        border: `1px solid ${
          isWalk ? "rgba(251,191,36,0.25)" : "rgba(59,130,246,0.25)"
        }`,
        whiteSpace: "nowrap",
      }}
    >
      {isWalk ? "Walk-in" : "Booked"}
    </span>
  );
}

function LevelBadge({ service_type }: { service_type: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 6,
        padding: "3px 9px",
        background: "rgba(129,140,248,0.12)",
        color: "#818cf8",
        border: "1px solid rgba(129,140,248,0.25)",
        whiteSpace: "nowrap",
      }}
    >
      {service_type || "General"}
    </span>
  );
}

// H_CFG kept as reference for HistoryItem — actual styling is inline below
type WinStatusKey = "open" | "cutoff" | "closed";

// ─── WINDOW STATUS CONFIG ────────────────────────────────────────────────────
const WIN_STATUS_CFG = {
  open: {
    label: "Open",
    color: "#6ee7b7",
    badgeBg: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(16,185,129,0.06))",
    badgeBorder: "rgba(52,211,153,0.4)",
    badgeGlow: "rgba(34,197,94,0.22)",
    activeBg: "linear-gradient(135deg, rgba(16,185,129,0.28) 0%, rgba(5,150,105,0.12) 100%)",
    activeBorder: "rgba(52,211,153,0.6)",
    activeGlow: "0 4px 16px rgba(16,185,129,0.24), inset 0 1px 0 rgba(255,255,255,0.2)",
    iconGlow: "drop-shadow(0 0 6px rgba(52,211,153,0.5))",
    dotColor: "#22c55e",
    dotAnim: "statusDotPulse 2s ease-in-out infinite",
  },
  cutoff: {
    label: "Cut-off",
    color: "#fde68a",
    badgeBg: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(217,119,6,0.06))",
    badgeBorder: "rgba(251,191,36,0.4)",
    badgeGlow: "rgba(245,158,11,0.22)",
    activeBg: "linear-gradient(135deg, rgba(245,158,11,0.28) 0%, rgba(217,119,6,0.12) 100%)",
    activeBorder: "rgba(251,191,36,0.6)",
    activeGlow: "0 4px 16px rgba(245,158,11,0.24), inset 0 1px 0 rgba(255,255,255,0.2)",
    iconGlow: "drop-shadow(0 0 6px rgba(251,191,36,0.5))",
    dotColor: "#f59e0b",
    dotAnim: "statusAmberBreathe 2s ease-in-out infinite",
  },
  closed: {
    label: "Closed",
    color: "#fca5a5",
    badgeBg: "linear-gradient(135deg, rgba(239,68,68,0.16), rgba(185,28,28,0.06))",
    badgeBorder: "rgba(248,113,113,0.38)",
    badgeGlow: "rgba(239,68,68,0.18)",
    activeBg: "linear-gradient(135deg, rgba(239,68,68,0.24) 0%, rgba(185,28,28,0.1) 100%)",
    activeBorder: "rgba(248,113,113,0.5)",
    activeGlow: "0 4px 16px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
    iconGlow: "drop-shadow(0 0 6px rgba(239,68,68,0.5))",
    dotColor: "#ef4444",
    dotAnim: "none",
  },
};

// ╔═══════════════════════════════════════════════════════════╗
// ║  STABLE SUB-COMPONENTS (top-level — never re-created)    ║
// ║  These were previously inline inside AdminDashboard,     ║
// ║  causing flicker/remount on every state change.          ║
// ╚═══════════════════════════════════════════════════════════╝

// ── GraceTimer ────────────────────────────────────────────────────────────────
interface GraceTimerProps {
  graceTime: number;
  graceActive: boolean;
  noShowWarning: boolean;
  sGrace: number;
  onMarkNoShow: () => void;
  isRegistrar?: boolean;
}
function GraceTimer({ graceTime, graceActive, noShowWarning, sGrace, onMarkNoShow, isRegistrar }: GraceTimerProps) {
  const circumference = 2 * Math.PI * 38;
  const dashOffset = circumference * (1 - graceTime / sGrace);
  const activeColor = isRegistrar ? "#a78bfa" : "#3b82f6";
  const activeBg = isRegistrar ? "rgba(139,92,246,0.14)" : "rgba(37,99,235,0.12)";
  const activeBorder = isRegistrar ? "rgba(167,139,250,0.35)" : "rgba(37,99,235,0.25)";

  return (
    <div
      style={{
        background: noShowWarning
          ? "rgba(239,68,68,0.12)"
          : graceActive
          ? activeBg
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${
          noShowWarning
            ? "rgba(239,68,68,0.35)"
            : graceActive
            ? activeBorder
            : "rgba(255,255,255,0.08)"
        }`,
        borderRadius: 14,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        transition: "all 0.4s ease",
      }}
    >
      <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle
            className="grace-ring"
            cx="40" cy="40" r="38" fill="none"
            stroke={noShowWarning ? "#ef4444" : graceTime <= 5 ? "#f59e0b" : activeColor}
            strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {noShowWarning ? (
            <AlertTriangle size={22} color="#ef4444" className="noshow-pulse" />
          ) : (
            <>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, color: graceTime <= 5 ? "#fbbf24" : "white", lineHeight: 1 }}>
                {graceTime}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.04em" }}>SEC</div>
            </>
          )}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {noShowWarning ? (
          <div className="noshow-pulse">
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", marginBottom: 4 }}>⚠ Grace Period Expired</div>
            <div style={{ fontSize: 11, color: "rgba(248,113,113,0.7)", lineHeight: 1.5, marginBottom: 10 }}>
              User did not appear. Mark as No-Show or Recall.
            </div>
            <button
              onClick={onMarkNoShow}
              className="ctrl-btn"
              style={{ background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "7px 14px", color: "#fca5a5", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 6 }}
            >
              <ShieldAlert size={13} /> Mark as No-Show
            </button>
          </div>
        ) : graceActive ? (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>Grace Period Active</div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ height: "100%", width: `${(graceTime / sGrace) * 100}%`, background: graceTime <= 5 ? "#f59e0b" : activeColor, borderRadius: 99, transition: "width 1s linear, background 0.3s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>User has {graceTime}s to reach the window</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Timer Idle</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Call Next to start the grace timer</div>
          </>
        )}
      </div>
    </div>
  );
}

// ── HistoryItemRow ─────────────────────────────────────────────────────────────
function HistoryItemRow({ h }: { h: HistoryItem }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "served": return { bg: "rgba(16,185,129,0.15)", text: "#34d399", border: "rgba(16,185,129,0.2)" };
      case "noshow": return { bg: "rgba(239,68,68,0.15)", text: "#f87171", border: "rgba(239,68,68,0.2)" };
      case "cancelled": return { bg: "rgba(249,115,22,0.15)", text: "#fb923c", border: "rgba(249,115,22,0.3)" };
      case "removed": return { bg: "rgba(100,116,139,0.15)", text: "#94a3b8", border: "rgba(100,116,139,0.2)" };
      default: return { bg: "rgba(100,116,139,0.15)", text: "#94a3b8", border: "rgba(100,116,139,0.2)" };
    }
  };
  const colors = getStatusColor(h.status);
  const ticket = h.ticket_number || h.ticket || "—";
  const name = h.user_name || h.name || "Client";
  const time = h.appointment_time || h.time || "—";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>
        {ticket}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{name}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{time}</div>
      </div>
      <div style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 6, letterSpacing: "0.04em" }}>
        {h.status ? h.status.toUpperCase() : "UNKNOWN"}
      </div>
    </div>
  );
}

// ── WindowOperationsCard ──────────────────────────────────────────────────────
interface WindowOperationsCardProps {
  cashierStatus: string;
  registrarStatus: string;
  windowStatusSaving: boolean;
  onUpdate: (dept: string, status: string) => void;
  cardBg?: string;
  cardBorder?: string;
}
function WindowOperationsCard({ cashierStatus, registrarStatus, windowStatusSaving, onUpdate, cardBg, cardBorder }: WindowOperationsCardProps) {
  const windows = [
    { key: "cashier", label: "Cashier Window", status: cashierStatus },
    { key: "registrar", label: "Registrar Window", status: registrarStatus },
  ];
  return (
    <div
      style={{
        background: cardBg || "rgba(15,25,54,0.8)",
        border: `1px solid ${cardBorder || "rgba(255,255,255,0.08)"}`,
        borderRadius: 20,
        padding: "20px",
        marginBottom: 16,
        transition: "background 0.35s ease, border-color 0.35s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DoorOpen size={14} color="#a78bfa" />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.08em" }}>WINDOW OPERATIONS</span>
        </div>
        {windowStatusSaving && (
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 5, fontStyle: "italic" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.3)", borderTop: "1.5px solid white", animation: "spin 0.7s linear infinite" }} />
            Saving…
          </span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {windows.map(({ key, label, status }) => {
          const activeCfg = WIN_STATUS_CFG[status as WinStatusKey];
          return (
            <div
              key={key}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.01em" }}>
                  {label}
                </span>
                {/* Modern Holographic Status Pill */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: activeCfg.badgeBg,
                    border: `1px solid ${activeCfg.badgeBorder}`,
                    boxShadow: `0 2px 12px ${activeCfg.badgeGlow}, inset 0 1px 0 rgba(255,255,255,0.14)`,
                    borderRadius: 99,
                    padding: "3px 10px 3px 8px",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: activeCfg.dotColor,
                      boxShadow: `0 0 8px ${activeCfg.dotColor}`,
                      animation: activeCfg.dotAnim,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: "0.09em",
                      color: activeCfg.color,
                    }}
                  >
                    {activeCfg.label.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Modern Cyber Console Dock */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 4,
                  background: "rgba(8, 12, 26, 0.65)",
                  padding: 4,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {(["open", "cutoff", "closed"] as WinStatusKey[]).map((opt) => {
                  const cfg = WIN_STATUS_CFG[opt];
                  const isActive = status === opt;
                  const icons: Record<WinStatusKey, React.ElementType> = { open: DoorOpen, cutoff: Scissors, closed: DoorClosed };
                  const Icon = icons[opt];
                  return (
                    <button
                      key={opt}
                      className={`win-opt-btn ${isActive ? "active" : ""}`}
                      onClick={() => onUpdate(key, opt)}
                      style={{
                        padding: "8px 4px",
                        borderRadius: 9,
                        border: isActive ? `1px solid ${cfg.activeBorder}` : "1px solid transparent",
                        background: isActive ? cfg.activeBg : "transparent",
                        color: isActive ? cfg.color : "rgba(255,255,255,0.4)",
                        fontSize: 11,
                        fontWeight: isActive ? 700 : 500,
                        cursor: "pointer",
                        fontFamily: "'Outfit',sans-serif",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        boxShadow: isActive ? cfg.activeGlow : "none",
                        transition: "all 0.2s cubic-bezier(.22,.68,0,1.2)",
                      }}
                    >
                      <Icon
                        size={14}
                        style={{
                          filter: isActive ? cfg.iconGlow : "none",
                          transition: "filter 0.2s ease, transform 0.2s ease",
                          transform: isActive ? "scale(1.08)" : "scale(1)",
                        }}
                      />
                      <span style={{ letterSpacing: "0.01em" }}>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ╔═══════════════════════════════════════════════════════════╗
// ║  MAIN COMPONENT                                          ║
// ╚═══════════════════════════════════════════════════════════╝
export default function AdminDashboard() {

  const [activeNav, setActiveNav] = useState("dashboard");

  // ── Settings state — loaded from localStorage on mount ──
  const [sGrace, setSGrace] = useState<number>(() => {
    const v = localStorage.getItem("admin_sGrace");
    return v ? Number(v) : 15;
  });
  const [sWindow, setSWindow] = useState<string>(() =>
    localStorage.getItem("admin_sWindow") ?? "1"
  );
  const [sPrinter, setSPrinter] = useState<boolean>(() =>
    localStorage.getItem("admin_sPrinter") === "true"
  );
  const [sMaxQueue, setSMaxQueue] = useState<number>(() => {
    const v = localStorage.getItem("admin_sMaxQueue");
    return v ? Number(v) : 50;
  });
  const [sAutoAdvance, setSAutoAdvance] = useState<boolean>(() =>
    localStorage.getItem("admin_sAutoAdvance") === "true"
  );
  const [sAudio, setSAudio] = useState<boolean>(() =>
    localStorage.getItem("admin_sAudio") !== "false"
  );
  const [sPwModal, setSPwModal] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Audio chime trigger helper
  const triggerChime = (type: "call" | "alert" | "complete") => {
    if (sAudio) playChime(type);
  };

  // ── Dual-Window & Active Department ───────────────────────
  const activeDepartment = sWindow === "1" ? "Cashier" : "Registrar";
  const isRegistrar = activeDepartment === "Registrar";

  // ── Theme Palettes: Cashier (Cobalt Blue) vs Registrar (Cyber Amethyst/Violet) ──
  const theme = isRegistrar
    ? {
        isRegistrar: true,
        bgRoot: "#0c0818",
        bgSidebar: "linear-gradient(180deg, #180f33 0%, #0c0818 100%)",
        bgHeader: "rgba(18, 12, 34, 0.95)",
        bgCard: "rgba(27, 18, 52, 0.85)",
        bgCardSubtle: "rgba(139, 92, 246, 0.06)",
        borderCard: "rgba(167, 139, 250, 0.18)",
        borderSubtle: "rgba(167, 139, 250, 0.1)",
        primary: "#8b5cf6",
        primaryLight: "#c084fc",
        primaryLighter: "#e9d5ff",
        primaryGradient: "linear-gradient(135deg, #7c3aed, #6d28d9)",
        primaryGlow: "rgba(124, 58, 237, 0.45)",
        terminalBg: "linear-gradient(145deg, #2a1154 0%, #1e0d3d 60%, #130826 100%)",
        terminalBorder: "rgba(167, 139, 250, 0.45)",
        terminalGlow: "0 0 40px rgba(147, 51, 234, 0.22)",
        terminalOrb: "rgba(167, 139, 250, 0.12)",
        activeNavBg: "rgba(139, 92, 246, 0.25)",
        activeNavBorder: "rgba(167, 139, 250, 0.4)",
        activeNavColor: "#c084fc",
        statQueueBg: "rgba(139, 92, 246, 0.14)",
        statQueueBorder: "rgba(167, 139, 250, 0.28)",
        statQueueColor: "#a78bfa",
        accentGlow: "rgba(147, 51, 234, 0.25)",
        toggleActive: "rgba(124, 58, 237, 0.85)",
        toggleBorder: "rgba(167, 139, 250, 0.7)",
      }
    : {
        isRegistrar: false,
        bgRoot: "#0d1526",
        bgSidebar: "linear-gradient(180deg, #0f1d3a 0%, #0d1526 100%)",
        bgHeader: "rgba(13, 21, 38, 0.95)",
        bgCard: "rgba(15, 25, 54, 0.8)",
        bgCardSubtle: "rgba(37, 99, 235, 0.05)",
        borderCard: "rgba(255, 255, 255, 0.08)",
        borderSubtle: "rgba(255, 255, 255, 0.05)",
        primary: "#2563eb",
        primaryLight: "#60a5fa",
        primaryLighter: "#bfdbfe",
        primaryGradient: "linear-gradient(135deg, #2563eb, #1d4ed8)",
        primaryGlow: "rgba(37, 99, 235, 0.4)",
        terminalBg: "linear-gradient(145deg, #0f2057 0%, #0d1a40 60%, #0a1630 100%)",
        terminalBorder: "rgba(37, 99, 235, 0.35)",
        terminalGlow: "0 0 40px rgba(37, 99, 235, 0.1)",
        terminalOrb: "rgba(37, 99, 235, 0.08)",
        activeNavBg: "rgba(37, 99, 235, 0.25)",
        activeNavBorder: "rgba(37, 99, 235, 0.3)",
        activeNavColor: "#60a5fa",
        statQueueBg: "rgba(37, 99, 235, 0.1)",
        statQueueBorder: "rgba(37, 99, 235, 0.2)",
        statQueueColor: "#3b82f6",
        accentGlow: "rgba(37, 99, 235, 0.2)",
        toggleActive: "rgba(37, 99, 235, 0.8)",
        toggleBorder: "rgba(59, 130, 246, 0.6)",
      };

  const [queue, setQueue] = useState<QueueItem[]>([]);
  // Derived: only tickets belonging to the active window's department
  const activeWindowQueue = queue.filter((s) => {
    const dept = s.department || (s.ticket?.startsWith("R") ? "Registrar" : "Cashier");
    return dept === activeDepartment;
  });

  // Dual-window serving state: each department maintains its own serving ticket
  const [servingByDept, setServingByDept] = useState<Record<string, QueueItem | null>>({
    Cashier: null,
    Registrar: null,
  });
  const serving = servingByDept[activeDepartment] ?? null;

  const setActiveServing = (item: QueueItem | null, dept: string = activeDepartment) => {
    setServingByDept((prev) => ({ ...prev, [dept]: item }));
  };

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [paused, setPaused] = useState(false);

  // Dual-window grace and warning state decoupled per department
  const [graceByDept, setGraceByDept] = useState<Record<string, { active: boolean; time: number; warning: boolean }>>({
    Cashier: { active: false, time: sGrace, warning: false },
    Registrar: { active: false, time: sGrace, warning: false },
  });
  const graceActive = graceByDept[activeDepartment]?.active ?? false;
  const graceTime = graceByDept[activeDepartment]?.time ?? sGrace;
  const noShowWarning = graceByDept[activeDepartment]?.warning ?? false;
  const [totalServed, setTotalServed] = useState(0);
  const [noShows, setNoShows] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [walkInModal, setWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPurpose, setWalkInPurpose] = useState("");
  const [flash, setFlash] = useState(false);
  const [recallPing, setRecallPing] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [removeConfirmTicket, setRemoveConfirmTicket] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearingQueue, setClearingQueue] = useState(false);

  // ── Change-password modal state ──────────────────────────────
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // ── Walk-in department selector & status ─────────────────────
  const [walkInDepartment, setWalkInDepartment] = useState("Cashier");
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInError, setWalkInError] = useState<string | null>(null);

  // ── Printable ticket stub modal state ────────────────────────
  const [printedTicket, setPrintedTicket] = useState<QueueItem | null>(null);

  // ── Upcoming appointments ────────────────────────────────────
  const [upcoming, setUpcoming] = useState<HistoryItem[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);

  // ── Window Status State ──────────────────────────────────────
  const [cashierStatus, setCashierStatus] = useState("open");
  const [registrarStatus, setRegistrarStatus] = useState("open");
  const [windowStatusSaving, setWindowStatusSaving] = useState(false);

  // Live Queue filters
  const [lqSearch, setLqSearch] = useState("");
  const [lqProgram, setLqProgram] = useState("all");
  const [lqType, setLqType] = useState("all");
  const [lqSort, setLqSort] = useState("position");
  const [lqDeptSel, setLqDeptSel] = useState("all");

  // History filters
  const [hSearch, setHSearch] = useState("");
  const [hStatus, setHStatus] = useState("all");
  const [hLevel, setHLevel] = useState("all");
  const [hSortCol, setHSortCol] = useState("time");
  const [hSortDir, setHSortDir] = useState("desc");

  // ── History tab: live stats fetched from Supabase ─────────
  const [historyStats, setHistoryStats] = useState({
    completionRate: 0,
    totalServed: 0,
    noShowRate: 0,
  });

  const fetchHistoryData = async () => {
    const { data: allHistory } = await supabase
      .from("queue_tickets")
      .select("status")
      .in("status", ["served", "noshow", "removed", "cancelled"]);

    if (allHistory && allHistory.length > 0) {
      const total = allHistory.length;
      const served = allHistory.filter((t) => t.status === "served").length;
      const noshow = allHistory.filter((t) => t.status === "noshow").length;
      setHistoryStats({
        totalServed: served,
        completionRate: Math.round((served / total) * 100),
        noShowRate: Math.round((noshow / total) * 100),
      });
    } else {
      setHistoryStats({ completionRate: 0, totalServed: 0, noShowRate: 0 });
    }

    const { data: logData } = await supabase
      .from("queue_tickets")
      .select("*")
      .in("status", ["served", "noshow", "removed", "cancelled"])
      .order("created_at", { ascending: false })
      .limit(100);
    if (logData) setHistory(logData);
  };

  useEffect(() => {
    if (activeNav === "history") {
      fetchHistoryData();
    }
    if (activeNav === "dashboard") {
      fetchUpcoming();
    }
  }, [activeNav]);

  // ── Fetch upcoming (future-date) appointments ──────────────
  const fetchUpcoming = async () => {
    setUpcomingLoading(true);
    try {
      const today = getLocalTodayDateStr();

      const { data, error } = await supabase
        .from("queue_tickets")
        .select("*")
        .eq("status", "waiting")
        .order("appointment_time", { ascending: true })
        .limit(150);

      if (error) {
        if (import.meta.env.DEV) console.warn("[DEV] fetchUpcoming error:", error.message);
        setUpcoming([]);
      } else {
        const future = (data || []).filter((row: Record<string, string>) => {
          const apptTime = row.appointment_time || "";
          if (!apptTime.includes("T")) return false;
          const datePart = apptTime.split("T")[0];
          return datePart > today;
        });
        setUpcoming(future);
      }
    } finally {
      setUpcomingLoading(false);
    }
  };

  // Load upcoming on mount
  useEffect(() => { fetchUpcoming(); }, []);

  // ── Auth: session gatekeeper ──────────────────────────────
  const [session, setSession] = useState<any>(null);
  const displayName: string =
    ((session?.user?.user_metadata?.display_name as string | undefined) ?? "").trim() || "Admin";
  const userEmail: string = session?.user?.email ?? "admin@sasched.io";
  const initials = displayName.substring(0, 2).toUpperCase();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // ── Dual-window Grace Countdown (ticks independently for Cashier & Registrar) ──
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setGraceByDept((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const dept of ["Cashier", "Registrar"]) {
          if (next[dept]?.active) {
            const cur = next[dept].time;
            if (cur <= 1) {
              next[dept] = { ...next[dept], active: false, time: 0, warning: true };
              triggerChime("alert");
              changed = true;
            } else {
              next[dept] = { ...next[dept], time: cur - 1 };
              changed = true;
            }
          }
        }
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paused, sAudio]);

  // ── Helper: map a Supabase row → queue item shape ─────────
  const rowToQueueItem = (row: Record<string, string>, index: number): QueueItem => ({
    ticket: row.ticket_number,
    name: row.user_name,
    service_type: row.service_type,
    time: row.appointment_time,
    type: row.booking_type === "walkin" ? "walkin" : "booked",
    department: row.department || (row.ticket_number?.startsWith("R") ? "Registrar" : "Cashier"),
    eta: (index + 1) * 2,
    calledAt: null,
    id: row.id,
  } as QueueItem);

  // ── Fetch initial waiting tickets + window_status from Supabase ─
  useEffect(() => {
    const fetchQueue = async () => {
      const { data, error } = await supabase
        .from("queue_tickets")
        .select("*")
        .eq("status", "waiting")
        .order("created_at", { ascending: true });

      if (error) {
        if (import.meta.env.DEV) console.warn("[DEV] Error fetching queue:", error.message);
        return;
      }

      // Filter: only appointments for today or walk-ins belong in the live queue
      const todayTickets = (data || []).filter((row: Record<string, string>) =>
        isTodayAppointment(row.appointment_time)
      );
      setQueue(todayTickets.map(rowToQueueItem));
    };

    const fetchWindowStatus = async () => {
      const { data, error } = await supabase
        .from("window_status")
        .select("cashier_status, registrar_status")
        .eq("id", 1)
        .single();

      if (error) {
        if (import.meta.env.DEV) console.warn("[DEV] Error fetching window_status:", error.message);
        return;
      }

      if (data) {
        setCashierStatus(data.cashier_status || "open");
        setRegistrarStatus(data.registrar_status || "open");
      }
    };

    // Restore currently-serving tickets for both windows without .maybeSingle() crash
    const restoreServing = async () => {
      const { data, error } = await supabase
        .from("queue_tickets")
        .select("*")
        .eq("status", "serving");
      if (!error && data) {
        const restored: Record<string, QueueItem | null> = { Cashier: null, Registrar: null };
        data.forEach((row: Record<string, string>) => {
          const dept = row.department === "Registrar" ? "Registrar" : "Cashier";
          restored[dept] = rowToQueueItem(row, 0);
        });
        setServingByDept(restored);
        setGraceByDept({
          Cashier: { active: false, time: sGrace, warning: false },
          Registrar: { active: false, time: sGrace, warning: false },
        });
      }
    };

    // Initialize Served Today and No-Shows using accurate local-midnight date range
    const initTodayStats = async () => {
      const now = new Date();
      const localStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const localEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
      const { data } = await supabase
        .from("queue_tickets")
        .select("status")
        .in("status", ["served", "noshow"])
        .gte("created_at", localStart)
        .lte("created_at", localEnd);
      if (data) {
        setTotalServed(data.filter((r: Record<string, string>) => r.status === "served").length);
        setNoShows(data.filter((r: Record<string, string>) => r.status === "noshow").length);
      }
    };

    fetchQueue();
    fetchWindowStatus();
    restoreServing();
    initTodayStats();
  }, []);

  // ── Realtime subscriptions: queue_tickets + window_status ─
  useEffect(() => {
    const channel = supabase
      .channel("admin_realtime_sync")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "queue_tickets" },
        (payload) => {
          const newRow = payload.new as Record<string, string>;
          if (newRow.status !== "waiting") return;

          const isToday = isTodayAppointment(newRow.appointment_time);
          if (isToday) {
            setQueue((prev) => {
              if (prev.some((s) => s.ticket === newRow.ticket_number || (s.id && s.id === newRow.id))) return prev;
              return [...prev, rowToQueueItem(newRow, prev.length)];
            });
          } else {
            const apptTime = newRow.appointment_time || "";
            const today = getLocalTodayDateStr();
            if (apptTime.includes("T") && apptTime.split("T")[0] > today) {
              setUpcoming((prev) => {
                if (prev.some((u) => (u as Record<string, string>).id === newRow.id || (u as Record<string, string>).ticket_number === newRow.ticket_number)) return prev;
                return [...prev, newRow as unknown as HistoryItem].sort((a, b) =>
                  (a.appointment_time ?? "").localeCompare(b.appointment_time ?? "")
                );
              });
            }
          }
        }
      )
      // Status changes on tickets
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "queue_tickets" },
        (payload) => {
          const updated = payload.new as Record<string, string>;
          const dept = updated.department === "Registrar" ? "Registrar" : "Cashier";
          const terminal = ["cancelled", "served", "noshow", "removed", "serving"];

          if (terminal.includes(updated.status)) {
            setQueue((prev) => prev.filter((s) => s.ticket !== updated.ticket_number));
          }

          // Cross-admin serving sync
          if (updated.status === "serving") {
            setServingByDept((prev) => ({
              ...prev,
              [dept]: rowToQueueItem(updated, 0),
            }));
          } else if (["served", "noshow", "removed", "cancelled"].includes(updated.status)) {
            setServingByDept((prev) => {
              const nextServing = { ...prev };
              let changed = false;
              if (nextServing.Cashier?.ticket === updated.ticket_number) {
                nextServing.Cashier = null;
                changed = true;
              }
              if (nextServing.Registrar?.ticket === updated.ticket_number) {
                nextServing.Registrar = null;
                changed = true;
              }
              return changed ? nextServing : prev;
            });

            // Keep History list and charts updated in real-time
            setHistory((prev) => {
              const exists = prev.some((h) => h.id === updated.id || h.ticket_number === updated.ticket_number);
              if (exists) {
                return prev.map((h) => (h.id === updated.id || h.ticket_number === updated.ticket_number ? (updated as unknown as HistoryItem) : h));
              }
              return [updated as unknown as HistoryItem, ...prev].slice(0, 100);
            });
          }

          // If ticket was recalled or put back to waiting for today
          if (updated.status === "waiting" && isTodayAppointment(updated.appointment_time)) {
            setQueue((prev) => {
              if (prev.some((s) => s.ticket === updated.ticket_number)) return prev;
              return [...prev, rowToQueueItem(updated, prev.length)];
            });
          }

          // Future ticket handling: preserve waiting updates or remove when terminal
          if (updated.status !== "waiting") {
            setUpcoming((prev) =>
              prev.filter((u) => (u as Record<string, string>).id !== updated.id && (u as Record<string, string>).ticket_number !== updated.ticket_number)
            );
          } else {
            const apptTime = updated.appointment_time || "";
            const today = getLocalTodayDateStr();
            if (apptTime.includes("T") && apptTime.split("T")[0] > today) {
              setUpcoming((prev) => {
                const idx = prev.findIndex((u) => (u as Record<string, string>).id === updated.id || (u as Record<string, string>).ticket_number === updated.ticket_number);
                if (idx >= 0) {
                  const copy = [...prev];
                  copy[idx] = updated as unknown as HistoryItem;
                  return copy;
                }
                return [...prev, updated as unknown as HistoryItem].sort((a, b) =>
                  (a.appointment_time ?? "").localeCompare(b.appointment_time ?? "")
                );
              });
            }
          }
        }
      )
      // Realtime Window Status sync across operators
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "window_status" },
        (payload) => {
          const newStatus = payload.new as Record<string, string>;
          if (newStatus.cashier_status) setCashierStatus(newStatus.cashier_status);
          if (newStatus.registrar_status) setRegistrarStatus(newStatus.registrar_status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Update window status in Supabase ─────────────────────
  const updateWindowStatus = async (dept: string, newStatus: string) => {
    setWindowStatusSaving(true);
    if (dept === "cashier") setCashierStatus(newStatus);
    else setRegistrarStatus(newStatus);

    const updatePayload =
      dept === "cashier"
        ? { cashier_status: newStatus }
        : { registrar_status: newStatus };

    const { error } = await supabase
      .from("window_status")
      .update(updatePayload)
      .eq("id", 1);

    if (error) {
      if (import.meta.env.DEV) console.warn("[DEV] Error updating window status:", error.message);
      if (dept === "cashier") setCashierStatus(cashierStatus);
      else setRegistrarStatus(registrarStatus);
    }

    setWindowStatusSaving(false);
  };

  // ── Core queue actions ───────────────────────────────────
  const startGrace = (dept: string = activeDepartment) => {
    setGraceByDept((prev) => ({
      ...prev,
      [dept]: { active: true, time: sGrace, warning: false },
    }));
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  };

  const callNext = async () => {
    if (paused || (!serving && activeWindowQueue.length === 0)) return;

    const actionTime = getNowTimeStr();

    // 1. Mark current serving student as 'served' in Supabase
    if (serving) {
      const historyItem: HistoryItem = {
        id: serving.id || `hist_${Date.now()}`,
        ticket_number: serving.ticket,
        ticket: serving.ticket,
        user_name: serving.name,
        name: serving.name,
        service_type: serving.service_type,
        department: serving.department,
        status: "served",
        time: actionTime,
        appointment_time: actionTime,
        duration: "5 min",
        created_at: new Date().toISOString(),
      };
      setHistory((h) => [historyItem, ...h].slice(0, 50));
      setTotalServed((n) => n + 1);
      triggerChime("complete");

      const { error: servedError } = await supabase
        .from("queue_tickets")
        .update({ status: "served" })
        .eq("ticket_number", serving.ticket);
      if (servedError && import.meta.env.DEV)
        console.warn("[DEV] Error marking served:", servedError.message);
    }

    // 2. If no more tickets for this window, clear the terminal
    if (activeWindowQueue.length === 0) {
      setActiveServing(null);
      setGraceByDept((prev) => ({
        ...prev,
        [activeDepartment]: { active: false, time: sGrace, warning: false },
      }));
      return;
    }

    // 3. Promote next student for THIS window to 'serving'
    const next = activeWindowQueue[0];
    const { error: servingError } = await supabase
      .from("queue_tickets")
      .update({ status: "serving" })
      .eq("ticket_number", next.ticket);
    if (servingError && import.meta.env.DEV)
      console.warn("[DEV] Error marking serving:", servingError.message);

    setActiveServing({ ...next, calledAt: actionTime });
    setQueue((q) => q.filter((s) => s.ticket !== next.ticket));
    triggerChime("call");
    startGrace();
  };

  const recall = () => {
    setRecallPing(true);
    setTimeout(() => setRecallPing(false), 1200);
    setGraceByDept((prev) => ({
      ...prev,
      [activeDepartment]: { active: true, time: sGrace, warning: false },
    }));
    triggerChime("call");
  };

  const markNoShow = async () => {
    if (!serving) return;

    const actionTime = getNowTimeStr();

    // Update Supabase first
    const { error } = await supabase
      .from("queue_tickets")
      .update({ status: "noshow" })
      .eq("ticket_number", serving.ticket);
    if (error && import.meta.env.DEV) console.warn("[DEV] Error marking no-show:", error.message);

    const historyItem: HistoryItem = {
      id: serving.id || `hist_${Date.now()}`,
      ticket_number: serving.ticket,
      ticket: serving.ticket,
      user_name: serving.name,
      name: serving.name,
      service_type: serving.service_type,
      department: serving.department,
      status: "noshow",
      time: actionTime,
      appointment_time: actionTime,
      duration: "—",
      created_at: new Date().toISOString(),
    };
    setHistory((h) => [historyItem, ...h].slice(0, 50));
    setNoShows((n) => n + 1);
    setGraceByDept((prev) => ({
      ...prev,
      [activeDepartment]: { active: false, time: sGrace, warning: false },
    }));

    if (sAutoAdvance && activeWindowQueue.length > 0) {
      const next = activeWindowQueue[0];
      // Update Supabase to 'serving' so user gets notified
      const { error: nextError } = await supabase
        .from("queue_tickets")
        .update({ status: "serving" })
        .eq("ticket_number", next.ticket);
      if (nextError && import.meta.env.DEV)
        console.warn("[DEV] Error promoting auto-advance ticket:", nextError.message);

      setActiveServing({ ...next, calledAt: actionTime });
      setQueue((q) => q.filter((s) => s.ticket !== next.ticket));
      triggerChime("call");
      startGrace();
    } else {
      setActiveServing(null);
    }
  };

  const removeFromQueue = async (ticket: string) => {
    const student = queue.find((s) => s.ticket === ticket || s.id === ticket);
    const targetTicket = student?.ticket || ticket;
    const actionTime = getNowTimeStr();

    const { error } = await supabase
      .from("queue_tickets")
      .update({ status: "removed" })
      .or(`ticket_number.eq.${targetTicket},id.eq.${ticket}`);
    if (error && import.meta.env.DEV) console.warn("[DEV] Error removing from queue:", error.message);

    setRemoveId(targetTicket);
    setRemoveConfirmTicket(null);
    setTimeout(() => {
      setQueue((q) => q.filter((s) => s.ticket !== targetTicket && s.id !== ticket));
      if (student) {
        const historyItem: HistoryItem = {
          id: student.id || `hist_${Date.now()}`,
          ticket_number: student.ticket,
          ticket: student.ticket,
          user_name: student.name,
          name: student.name,
          service_type: student.service_type,
          department: student.department,
          status: "removed",
          time: actionTime,
          appointment_time: actionTime,
          duration: "—",
          created_at: new Date().toISOString(),
        };
        setHistory((h) => [historyItem, ...h].slice(0, 50));
      }
      setRemoveId(null);
    }, 350);
  };

  const addWalkIn = async () => {
    if (!walkInName || walkInLoading) return;

    // Feature 2: Check max queue capacity
    if (activeWindowQueue.length >= sMaxQueue) {
      setWalkInError(`Queue is at maximum capacity (${sMaxQueue} users). Increase capacity in Settings or serve current clients.`);
      return;
    }

    setWalkInLoading(true);
    setWalkInError(null);

    const deptPrefix = walkInDepartment.charAt(0).toUpperCase();
    const suffix = String(Date.now()).slice(-4);
    const ticketNum = `${deptPrefix}-W-${suffix}`;
    const now = new Date();
    const apptTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    const walkInAccountId = crypto.randomUUID();
    const destinationWindow = walkInDepartment === "Cashier" ? "Cashier" : "Registrar";

    const { data, error } = await supabase
      .from("queue_tickets")
      .insert([{
        ticket_number: ticketNum,
        user_name: walkInName.trim(),
        account_id: walkInAccountId,
        service_type: walkInPurpose || "General",
        booking_type: "walkin",
        status: "waiting",
        department: walkInDepartment,
        destination_window: destinationWindow,
        appointment_time: apptTime,
      }])
      .select()
      .single();

    setWalkInLoading(false);

    if (error) {
      if (import.meta.env.DEV) console.error("[ADMIN] Walk-in insert error:", error);
      setWalkInError(
        error.message.includes("violates row-level security")
          ? "Permission denied. Check your Supabase RLS policies for queue_tickets."
          : error.message.includes("not-null constraint")
          ? `Missing required field: ${error.message.split('"')[1] ?? "unknown column"}`
          : error.message.includes("column")
          ? `DB column error: ${error.message}`
          : `Insert failed: ${error.message}`
      );
      return;
    }

    // Success — deduplicated queue update
    const newItem = rowToQueueItem(data as Record<string, string>, queue.length);
    setQueue((q) => q.some((s) => s.ticket === newItem.ticket) ? q : [...q, newItem]);
    setWalkInName("");
    setWalkInPurpose("");
    setWalkInError(null);
    setWalkInDepartment(activeDepartment);
    setWalkInModal(false);

    // Feature 1: Trigger paper ticket print if enabled
    if (sPrinter) {
      setPrintedTicket(newItem);
    }
  };

  // Persist settings to localStorage
  const saveSettings = () => {
    localStorage.setItem("admin_sGrace", String(sGrace));
    localStorage.setItem("admin_sWindow", sWindow);
    localStorage.setItem("admin_sPrinter", String(sPrinter));
    localStorage.setItem("admin_sMaxQueue", String(sMaxQueue));
    localStorage.setItem("admin_sAutoAdvance", String(sAutoAdvance));
    localStorage.setItem("admin_sAudio", String(sAudio));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2400);
  };

  // Change Password handler
  const handleChangePassword = async () => {
    setPwError(null);
    if (!pwCurrent) {
      setPwError("Current password is required.");
      return;
    }
    if (!pwNew || pwNew.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwLoading(true);

    if (session?.user?.email) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: pwCurrent,
      });
      if (verifyError) {
        setPwLoading(false);
        setPwError("Incorrect current password.");
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password: pwNew });
    setPwLoading(false);
    if (error) {
      setPwError(error.message);
      return;
    }
    setPwSuccess(true);
    setPwCurrent("");
    setPwNew("");
    setPwConfirm("");
    setTimeout(() => {
      setPwSuccess(false);
      setSPwModal(false);
    }, 1800);
  };

  // Safe Clear Queue: only mark waiting tickets in today's active window queue as removed
  const handleClearQueue = async () => {
    setClearingQueue(true);
    const ticketIdsToClear = activeWindowQueue.map((s) => s.id).filter(Boolean) as string[];
    const ticketNumsToClear = activeWindowQueue.map((s) => s.ticket).filter(Boolean);

    if (ticketIdsToClear.length > 0) {
      const { error } = await supabase
        .from("queue_tickets")
        .update({ status: "removed" })
        .in("id", ticketIdsToClear);
      if (error && import.meta.env.DEV) console.warn("[DEV] Clear queue error by id:", error.message);
    } else if (ticketNumsToClear.length > 0) {
      const { error } = await supabase
        .from("queue_tickets")
        .update({ status: "removed" })
        .in("ticket_number", ticketNumsToClear);
      if (error && import.meta.env.DEV) console.warn("[DEV] Clear queue error by ticket:", error.message);
    }

    setQueue((q) =>
      q.filter((s) => {
        const dept = s.department || (s.ticket?.startsWith("R") ? "Registrar" : "Cashier");
        return dept !== activeDepartment;
      })
    );
    setClearingQueue(false);
    setShowClearConfirm(false);
  };

  // Export history as CSV
  const handleExportCSV = () => {
    if (!history.length) return;
    const header = ["Ticket", "Name", "Service Type", "Department", "Status", "Time"].join(",");
    const rows = history.map((h: HistoryItem) =>
      [
        (h.ticket_number || h.ticket) ?? "",
        `"${((h.user_name || h.name) ?? "").replace(/"/g, '""')}"`,
        h.service_type ?? "",
        h.department ?? "",
        h.status ?? "",
        (h.appointment_time || h.time) ?? "",
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sasched_history_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };


  // NOTE: GraceTimer, HistoryItemRow, and WindowOperationsCard are now
  // stable top-level components defined above AdminDashboard.
  // This eliminates the flicker caused by React recreating them on every state tick.


  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "queue", icon: Users, label: "Live Queue" },
    { id: "history", icon: History, label: "History & Logs" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];


  // ╔═══════════════════════════════════════════════════════════╗
  // ║  renderDashboard                                         ║
  // ╚═══════════════════════════════════════════════════════════╝
  const renderDashboard = () => (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}>
      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "In Queue",
            value: activeWindowQueue.length,
            icon: Users,
            color: theme.statQueueColor,
            bg: theme.statQueueBg,
            border: theme.statQueueBorder,
          },
          {
            label: "Now Serving",
            value: serving ? serving.ticket : "—",
            icon: Monitor,
            color: "#a78bfa",
            bg: "rgba(167,139,250,0.1)",
            border: "rgba(167,139,250,0.2)",
          },
          {
            label: "Served Today",
            value: totalServed,
            icon: CheckCircle2,
            color: "#22c55e",
            bg: "rgba(34,197,94,0.1)",
            border: "rgba(34,197,94,0.2)",
          },
          {
            label: "No-Shows",
            value: noShows,
            icon: ZapOff,
            color: "#f87171",
            bg: "rgba(248,113,113,0.1)",
            border: "rgba(248,113,113,0.2)",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="stat-card fade-in"
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 16,
              padding: "18px 20px",
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <s.icon size={17} color={s.color} />
              </div>
            </div>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 28,
                fontWeight: 700,
                color: "white",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Window Operations Card (stable top-level, no flicker) ── */}
      <WindowOperationsCard
        cashierStatus={cashierStatus}
        registrarStatus={registrarStatus}
        windowStatusSaving={windowStatusSaving}
        onUpdate={updateWindowStatus}
        cardBg={theme.bgCard}
        cardBorder={theme.borderCard}
      />

      {/* Now Serving + Controls */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Terminal */}
        <div
          className={`fade-in ${flash ? "flash-enter" : ""}`}
          style={{
            background: theme.terminalBg,
            border: noShowWarning
              ? "1.5px solid rgba(248,113,113,0.5)"
              : `1.5px solid ${theme.terminalBorder}`,
            borderRadius: 20,
            padding: "24px",
            position: "relative",
            overflow: "hidden",
            animationDelay: "0.1s",
            boxShadow: noShowWarning
              ? "0 0 40px rgba(239,68,68,0.15)"
              : theme.terminalGlow,
            transition: "background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: noShowWarning
                ? "rgba(239,68,68,0.07)"
                : theme.terminalOrb,
              pointerEvents: "none",
              transition: "background 0.35s ease",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Monitor size={14} color={theme.primaryLight} />
              <span
                style={{
                  fontSize: 11,
                  color: theme.primaryLight,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                WINDOW {sWindow} · NOW SERVING
              </span>
            </div>
            {/* Modern Radar Pill Capsule */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: paused
                  ? "linear-gradient(135deg, rgba(245,158,11,0.16), rgba(217,119,6,0.06))"
                  : "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(16,185,129,0.06))",
                border: `1px solid ${paused ? "rgba(251,191,36,0.4)" : "rgba(52,211,153,0.4)"}`,
                boxShadow: `0 0 16px ${paused ? "rgba(245,158,11,0.18)" : "rgba(34,197,94,0.18)"}, inset 0 1px 0 rgba(255,255,255,0.14)`,
                borderRadius: 99,
                padding: "4px 11px 4px 9px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
              }}
            >
              {/* Animated Radar Beacon */}
              <div style={{ position: "relative", width: 8, height: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: `1.5px solid ${paused ? "#f59e0b" : "#22c55e"}`,
                    animation: "beaconRadar 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                  }}
                />
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: paused ? "#f59e0b" : "#22c55e",
                    boxShadow: `0 0 8px ${paused ? "#f59e0b" : "#22c55e"}`,
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: paused ? "#fde68a" : "#86efac",
                }}
              >
                {paused ? "PAUSED" : "ACTIVE"}
              </span>
            </div>
          </div>
          {serving ? (
            <>
              <div
                className={recallPing ? "ping-ring" : ""}
                style={{
                  display: "inline-block",
                  marginBottom: 16,
                  background: isRegistrar ? "rgba(139,92,246,0.2)" : "rgba(37,99,235,0.2)",
                  border: `1px solid ${isRegistrar ? "rgba(167,139,250,0.4)" : "rgba(37,99,235,0.4)"}`,
                  borderRadius: 14,
                  padding: "8px 18px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 38,
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "0.02em",
                    lineHeight: 1,
                  }}
                >
                  {serving.ticket}
                </span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "white",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {serving.name}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <LevelBadge service_type={serving.service_type} />
                  <TypeBadge type={serving.type} />
                  {serving.calledAt && (
                    <span
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.4)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Zap size={10} /> Called: {serving.calledAt}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <GraceTimer
                  graceTime={graceTime}
                  graceActive={graceActive}
                  noShowWarning={noShowWarning}
                  sGrace={sGrace}
                  onMarkNoShow={markNoShow}
                  isRegistrar={isRegistrar}
                />
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <Monitor
                size={40}
                color="rgba(255,255,255,0.1)"
                style={{ marginBottom: 12 }}
              />
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.3)",
                  fontWeight: 500,
                }}
              >
                No user at the window
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.2)",
                  marginTop: 4,
                }}
              >
                Press "Call Next" to begin
              </div>
            </div>
          )}
        </div>

        {/* Controls + Up Next */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            className="fade-in"
            style={{
              background: theme.bgCard,
              border: `1px solid ${theme.borderCard}`,
              borderRadius: 20,
              padding: "20px",
              animationDelay: "0.15s",
              transition: "background 0.35s ease, border-color 0.35s ease",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              QUEUE CONTROLS
            </div>
            <button
              className="ctrl-btn"
              onClick={callNext}
              disabled={paused || (!serving && activeWindowQueue.length === 0)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 14,
                border: "none",
                background:
                  paused || (!serving && activeWindowQueue.length === 0)
                    ? (isRegistrar ? "rgba(124,58,237,0.2)" : "rgba(37,99,235,0.2)")
                    : serving && activeWindowQueue.length === 0
                    ? "linear-gradient(135deg,#16a34a,#15803d)"
                    : theme.primaryGradient,
                color: "white",
                fontSize: 16,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontFamily: "'Outfit',sans-serif",
                marginBottom: 10,
                boxShadow:
                  paused || (!serving && activeWindowQueue.length === 0)
                    ? "none"
                    : serving && activeWindowQueue.length === 0
                    ? "0 8px 28px rgba(22,163,74,0.45)"
                    : `0 8px 28px ${theme.primaryGlow}`,
              }}
            >
              {serving && activeWindowQueue.length === 0 ? (
                <>
                  <CheckCircle2 size={20} /> Complete Service
                </>
              ) : (
                <>
                  <SkipForward size={20} /> Call Next
                  {activeWindowQueue.length > 0 && !paused && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: 99,
                        padding: "2px 8px",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {activeWindowQueue[0]?.ticket}
                    </div>
                  )}
                </>
              )}
            </button>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <button
                className="ctrl-btn"
                onClick={recall}
                disabled={!serving || paused}
                style={{
                  padding: "12px 10px",
                  borderRadius: 12,
                  border: "1px solid rgba(251,191,36,0.3)",
                  background: "rgba(251,191,36,0.1)",
                  color: "#fbbf24",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                <RotateCcw size={14} /> Recall
              </button>
              <button
                className="ctrl-btn"
                onClick={() => setPaused((p) => !p)}
                style={{
                  padding: "12px 10px",
                  borderRadius: 12,
                  border: paused
                    ? "1px solid rgba(34,197,94,0.3)"
                    : "1px solid rgba(255,255,255,0.1)",
                  background: paused
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(255,255,255,0.05)",
                  color: paused ? "#4ade80" : "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {paused ? (
                  <>
                    <PlayCircle size={14} /> Resume
                  </>
                ) : (
                  <>
                    <PauseCircle size={14} /> Pause
                  </>
                )}
              </button>
            </div>
            <button
              className="ctrl-btn"
              onClick={() => {
                setWalkInDepartment(activeDepartment);
                setWalkInModal(true);
              }}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 12,
                border: "1px solid " + theme.statQueueBorder,
                background: theme.statQueueBg,
                color: theme.statQueueColor,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              <UserPlus size={14} /> Add Walk-in User
            </button>
            {paused && (
              <div
                className="fade-in"
                style={{
                  marginTop: 12,
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  color: "#fbbf24",
                }}
              >
                <PauseCircle size={13} /> Queue is paused. Press Resume to
                continue.
              </div>
            )}
          </div>
          <div
            className="fade-in"
            style={{
              background: theme.bgCard,
              border: `1px solid ${theme.borderCard}`,
              borderRadius: 20,
              padding: "18px",
              flex: 1,
              animationDelay: "0.2s",
              transition: "background 0.35s ease, border-color 0.35s ease",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              UP NEXT
            </div>
            {activeWindowQueue.slice(0, 3).map((s, i) => (
              <div
                key={s.ticket}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "9px 0",
                  borderBottom:
                    i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  opacity: 1 - i * 0.2,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: isRegistrar ? "rgba(139,92,246,0.2)" : "rgba(37,99,235,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: theme.primaryLight,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.85)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.35)",
                      marginTop: 2,
                    }}
                  >
                    {s.ticket} · {s.service_type}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {s.time}
                </span>
              </div>
            ))}
            {activeWindowQueue.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px 0",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                Queue is clear
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Queue mini + History mini */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
        <div
          className="fade-in"
          style={{
            background: theme.bgCard,
            border: `1px solid ${theme.borderCard}`,
            borderRadius: 20,
            overflow: "hidden",
            animationDelay: "0.25s",
            transition: "background 0.35s ease, border-color 0.35s ease",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Users size={14} color={theme.primaryLight} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Live Queue
            </span>
            <div
              style={{
                background: isRegistrar ? "rgba(139,92,246,0.25)" : "rgba(37,99,235,0.25)",
                border: `1px solid ${isRegistrar ? "rgba(167,139,250,0.3)" : "rgba(37,99,235,0.3)"}`,
                borderRadius: 99,
                padding: "2px 9px",
                fontSize: 11,
                color: theme.primaryLight,
                fontWeight: 700,
              }}
            >
              {activeWindowQueue.length}
            </div>
            <button
              onClick={() => setActiveNav("queue")}
              style={{
                marginLeft: "auto",
                fontSize: 11,
                color: theme.primaryLight,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Outfit',sans-serif",
                fontWeight: 600,
              }}
            >
              View all →
            </button>
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {activeWindowQueue.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "36px",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                No users waiting in queue
              </div>
            ) : (
              activeWindowQueue.map((s) => (
                <div
                  key={s.ticket}
                  className="queue-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#93c5fd",
                      width: 52,
                      flexShrink: 0,
                    }}
                  >
                    {s.ticket}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.85)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.name}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.35)",
                        marginTop: 1,
                      }}
                    >
                      {s.service_type}
                    </div>
                  </div>
                  <LevelBadge service_type={s.service_type} />
                  <TypeBadge type={s.type} />
                  {/* GAP 2 FIX: Remove button per queue item */}
                  {(s.ticket || s.id) && (
                    <button
                      className="rm-btn"
                      onClick={() => removeFromQueue(s.ticket || s.id!)}
                      title="Remove from queue"
                      style={{
                        width: 24, height: 24, borderRadius: 6,
                        background: "rgba(239,68,68,0.12)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <X size={12} color="#f87171" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <div
          className="fade-in"
          style={{
            background: theme.bgCard,
            border: `1px solid ${theme.borderCard}`,
            borderRadius: 20,
            overflow: "hidden",
            animationDelay: "0.3s",
            transition: "background 0.35s ease, border-color 0.35s ease",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <History size={14} color="#a78bfa" />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Recent Log
            </span>
            <button
              onClick={() => setActiveNav("history")}
              style={{
                marginLeft: "auto",
                fontSize: 11,
                color: "#a78bfa",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Outfit',sans-serif",
                fontWeight: 600,
              }}
            >
              View all →
            </button>
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {history.map((h, i) => (
              <HistoryItemRow key={i} h={h} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Upcoming Appointments (Bug C fix) ─────────────── */}
      <div
        className="fade-in"
        style={{
          background: theme.bgCard,
          border: `1px solid ${theme.borderCard}`,
          borderRadius: 20,
          overflow: "hidden",
          marginTop: 16,
          transition: "background 0.35s ease, border-color 0.35s ease",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={14} color="#fbbf24" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Upcoming Appointments</span>
          {upcoming.length > 0 && (
            <div style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 99, padding: "2px 9px", fontSize: 11, color: "#fbbf24", fontWeight: 700 }}>
              {upcoming.length}
            </div>
          )}
          <button onClick={fetchUpcoming} style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
            <RotateCw size={11} /> Refresh
          </button>
        </div>
        <div style={{ maxHeight: 280, overflowY: "auto" }}>
          {upcomingLoading ? (
            <div style={{ textAlign: "center", padding: "28px", fontSize: 12, color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.1)", borderTop: "2px solid rgba(255,255,255,0.5)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              Loading upcoming appointments…
            </div>
          ) : upcoming.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
              No upcoming appointments found.{" "}
              <span style={{ opacity: 0.6 }}>(Appointments with a future date will appear here)</span>
            </div>
          ) : (
            (() => {
              // Group by the date portion of appointment_time
              // Future bookings store: "YYYY-MM-DDThh:mm AM" (student side convention)
              const groups: Record<string, HistoryItem[]> = {};
              upcoming.forEach((item) => {
                const apptTime = item.appointment_time || "";
                const d = apptTime.includes("T") ? apptTime.split("T")[0] : "Unknown";
                if (!groups[d]) groups[d] = [];
                groups[d].push(item);
              });
              return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([date, items]) => (
                <div key={date}>
                  <div style={{ padding: "8px 20px 4px", fontSize: 10, fontWeight: 800, color: "#fbbf24", letterSpacing: "0.08em", background: "rgba(251,191,36,0.05)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {date === "Unknown" ? "DATE UNKNOWN" : new Date(date + "T00:00:00").toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
                    <span style={{ marginLeft: 8, opacity: 0.6, fontWeight: 600 }}>{items.length} ticket{items.length !== 1 ? "s" : ""}</span>
                  </div>
                  {items.map((h, i) => {
                    const rawApptTime = h.appointment_time || "";
                    // Strip the date prefix to show only time (e.g. "9:00 AM")
                    const displayTime = rawApptTime.includes("T") ? rawApptTime.split("T")[1] : rawApptTime;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, minWidth: 60 }}>
                          {(h as Record<string, string>).ticket_number || "—"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{(h as Record<string, string>).user_name || "—"}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", display: "flex", gap: 8, marginTop: 2 }}>
                            <span>{displayTime}</span>
                            {(h as Record<string, string>).department && <span style={{ color: "#818cf8" }}>· {(h as Record<string, string>).department}</span>}
                            {h.service_type && <span>· {h.service_type}</span>}
                          </div>
                        </div>
                        <div style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)", fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 6, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                          UPCOMING
                        </div>
                      </div>
                    );
                  })}
                </div>
              ));
            })()

          )}
        </div>
      </div>
    </div>
  );

  // ╔═══════════════════════════════════════════════════════════╗
  // ║  renderLiveQueue                                         ║
  // ╚═══════════════════════════════════════════════════════════╝
  const renderLiveQueue = () => {
    // Bug 7 fix: department filter so admin can isolate Cashier vs Registrar
    const lqDeptFilter = (s: QueueItem) =>
      lqDeptSel === "all" || s.department === lqDeptSel;

    const filtered = queue
      .filter((s) => {
        const q = lqSearch.toLowerCase();
        const ms =
          (s.name ?? "").toLowerCase().includes(q) ||
          (s.ticket ?? "").toLowerCase().includes(q) ||
          (s.service_type ?? "").toLowerCase().includes(q);
        const mp = lqProgram === "all" || s.service_type === lqProgram;
        const mt = lqType === "all" || s.type === lqType;
        const md = lqDeptFilter(s);
        return ms && mp && mt && md;
      })
      .sort((a, b) => {
        if (lqSort === "name") return a.name.localeCompare(b.name);
        if (lqSort === "time") return a.time.localeCompare(b.time);
        return a.eta - b.eta;
      });

    const purposeCounts = PURPOSE_OPTIONS.reduce((acc, p) => {
      acc[p] = queue.filter((s) => s.service_type === p).length;
      return acc;
    }, {} as Record<string, number>);
    void purposeCounts;
    const walkCnt = queue.filter((s) => s.type === "walkin").length;
    const clearFilters = () => {
      setLqSearch("");
      setLqProgram("all");
      setLqType("all");
      setLqDeptSel("all");
    };
    const filtersActive = lqSearch || lqProgram !== "all" || lqType !== "all" || lqDeptSel !== "all";

    return (
      <div
        style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}
        className="fade-in"
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {[
            {
              label: "Total in Queue",
              value: queue.length,
              color: theme.statQueueColor,
              bg: theme.statQueueBg,
              border: theme.statQueueBorder,
            },
            {
              // Bug 1 fix: shsCnt was undefined — replaced with Cashier count
              label: "Cashier Window",
              value: queue.filter((s) => s.department === "Cashier").length,
              color: "#fbbf24",
              bg: "rgba(251,191,36,0.1)",
              border: "rgba(251,191,36,0.2)",
            },
            {
              // Bug 1 fix: colCnt was undefined — replaced with Registrar count
              label: "Registrar Window",
              value: queue.filter((s) => s.department === "Registrar").length,
              color: "#818cf8",
              bg: "rgba(129,140,248,0.12)",
              border: "rgba(129,140,248,0.2)",
            },
            {
              label: "Walk-ins",
              value: walkCnt,
              color: "#f87171",
              bg: "rgba(248,113,113,0.1)",
              border: "rgba(248,113,113,0.2)",
            },
          ].map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: p.bg,
                border: `1px solid ${p.border}`,
                borderRadius: 12,
                padding: "10px 18px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {p.value}
              </span>
              <span style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>
                {p.label}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            background: theme.bgCard,
            border: `1px solid ${theme.borderCard}`,
            borderRadius: 20,
            overflow: "hidden",
            transition: "background 0.35s ease, border-color 0.35s ease",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: "1 1 200px" }}>
              <Search
                size={13}
                color="rgba(255,255,255,0.3)"
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                value={lqSearch}
                onChange={(e) => setLqSearch(e.target.value)}
                placeholder="Search name, ticket, or program…"
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 32px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "white",
                  fontSize: 13,
                  fontFamily: "'Outfit',sans-serif",
                }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <SlidersHorizontal
                size={12}
                color="rgba(255,255,255,0.3)"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <select
                className="filter-sel"
                value={lqProgram}
                onChange={(e) => setLqProgram(e.target.value)}
                style={{
                  padding: "9px 30px 9px 28px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(15,25,60,0.95)",
                  color:
                    lqProgram !== "all" ? "white" : "rgba(255,255,255,0.45)",
                  fontSize: 12,
                  fontFamily: "'Outfit',sans-serif",
                  minWidth: 190,
                }}
              >
                <option value="all">All Purposes</option>
                {PURPOSE_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDownIcon
                size={12}
                color="rgba(255,255,255,0.3)"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <Filter
                size={12}
                color="rgba(255,255,255,0.3)"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <select
                className="filter-sel"
                value={lqType}
                onChange={(e) => setLqType(e.target.value)}
                style={{
                  padding: "9px 30px 9px 28px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(15,25,60,0.95)",
                  color: lqType !== "all" ? "white" : "rgba(255,255,255,0.45)",
                  fontSize: 12,
                  fontFamily: "'Outfit',sans-serif",
                  minWidth: 130,
                }}
              >
                <option value="all">All Types</option>
                <option value="booked">Booked</option>
                <option value="walkin">Walk-in</option>
              </select>
              <ChevronDownIcon
                size={12}
                color="rgba(255,255,255,0.3)"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <ArrowUpDown
                size={12}
                color="rgba(255,255,255,0.3)"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <select
                className="filter-sel"
                value={lqSort}
                onChange={(e) => setLqSort(e.target.value)}
                style={{
                  padding: "9px 30px 9px 28px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(15,25,60,0.95)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 12,
                  fontFamily: "'Outfit',sans-serif",
                  minWidth: 150,
                }}
              >
                <option value="position">Sort: Position</option>
                <option value="name">Sort: Name A–Z</option>
                <option value="time">Sort: Time Slot</option>
              </select>
              <ChevronDownIcon
                size={12}
                color="rgba(255,255,255,0.3)"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>
            {/* Bug 7 fix: Department filter chips */}
            <div style={{ display: "flex", gap: 6 }}>
              {(["all", "Cashier", "Registrar"] as const).map((dept) => (
                <button
                  key={dept}
                  onClick={() => setLqDeptSel(dept)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: lqDeptSel === dept
                      ? dept === "Cashier" ? "1px solid rgba(59,130,246,0.6)" : dept === "Registrar" ? "1px solid rgba(167,139,250,0.6)" : "1px solid rgba(255,255,255,0.3)"
                      : "1px solid rgba(255,255,255,0.1)",
                    background: lqDeptSel === dept
                      ? dept === "Cashier" ? "rgba(59,130,246,0.15)" : dept === "Registrar" ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.04)",
                    color: lqDeptSel === dept
                      ? dept === "Cashier" ? "#93c5fd" : dept === "Registrar" ? "#c4b5fd" : "rgba(255,255,255,0.8)"
                      : "rgba(255,255,255,0.35)",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {dept === "all" ? "All Windows" : dept}
                </button>
              ))}
            </div>
            {filtersActive && (
              <button
                onClick={clearFilters}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                <X size={11} /> Clear
              </button>
            )}
          </div>

          {/* Column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "44px 64px 1fr 160px 96px 100px 90px 80px 44px",
              padding: "9px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              gap: 8,
              alignItems: "center",
            }}
          >
            {[
              "#",
              "Ticket",
              "Name",
              "Purpose",
              "Time Slot",
              "Purpose Type",
              "Type",
              "Window",
              "",
            ].map((h, i) => (
              <div
                key={i}
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ maxHeight: 460, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "52px 20px" }}>
                <Search
                  size={32}
                  color="rgba(255,255,255,0.07)"
                  style={{ marginBottom: 12 }}
                />
                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.25)",
                    fontWeight: 500,
                  }}
                >
                  No users match your filters
                </div>
                <button
                  onClick={clearFilters}
                  style={{
                    marginTop: 10,
                    background: "none",
                    border: "none",
                    color: "#60a5fa",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filtered.map((s) => {
                const pos = queue.findIndex((q) => q.ticket === s.ticket) + 1;
                return (
                  <div
                    key={s.ticket}
                    className={`lq-row ${
                      removeId === s.ticket ? "row-remove" : ""
                    }`}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "44px 64px 1fr 160px 96px 100px 90px 80px 44px",
                      padding: "13px 20px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: 12,
                        color:
                          pos === 1 ? "#60a5fa" : "rgba(255,255,255,0.22)",
                        fontWeight: 700,
                      }}
                    >
                      {pos === 1 ? "→1" : pos}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      {s.ticket}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "white",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.5)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={s.service_type}
                    >
                      {s.service_type}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      <Clock size={10} />
                      {s.time}
                    </div>
                    <LevelBadge service_type={s.service_type} />
                    <TypeBadge type={s.type} />
                    <div style={{ fontSize: 10, fontWeight: 600, color: s.department === "Cashier" ? "#60a5fa" : "#a78bfa" }}>
                      {/* Bug 5 fix: show department (Cashier/Registrar), not service_type */}
                      {s.department || "—"}
                    </div>
                    <div
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      {/* Bug 6: two-click confirm in live queue tab */}
                      {removeConfirmTicket === s.ticket ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            className="ctrl-btn"
                            onClick={() => removeFromQueue(s.ticket)}
                            style={{
                              padding: "5px 10px", borderRadius: 7, border: "none",
                              background: "rgba(239,68,68,0.75)", color: "white",
                              fontSize: 11, fontWeight: 700, cursor: "pointer",
                              fontFamily: "'Outfit',sans-serif",
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setRemoveConfirmTicket(null)}
                            style={{
                              width: 28, height: 28, borderRadius: 7,
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <X size={11} color="rgba(255,255,255,0.5)" />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="lq-rm ctrl-btn"
                          onClick={() => setRemoveConfirmTicket(s.ticket)}
                          style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <X size={13} color="#f87171" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "11px 20px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              Showing{" "}
              <strong style={{ color: "rgba(255,255,255,0.6)" }}>
                {filtered.length}
              </strong>{" "}
              of{" "}
              <strong style={{ color: "rgba(255,255,255,0.6)" }}>
                {queue.length}
              </strong>{" "}
              users in queue
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {/* Feature 1: Clear Queue button */}
              <button
                className="ctrl-btn"
                onClick={() => setShowClearConfirm(true)}
                disabled={activeWindowQueue.length === 0}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 9,
                  background: activeWindowQueue.length === 0 ? "rgba(239,68,68,0.05)" : "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: activeWindowQueue.length === 0 ? "rgba(248,113,113,0.35)" : "#f87171",
                  fontSize: 12, fontWeight: 700, cursor: activeWindowQueue.length === 0 ? "not-allowed" : "pointer",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                <TrashIcon size={13} /> Clear Queue
              </button>
              <button
                className="ctrl-btn"
                onClick={() => setWalkInModal(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 9,
                  background: "rgba(167,139,250,0.1)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  color: "#c4b5fd", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "'Outfit',sans-serif",
                }}
              >
                <UserPlus size={13} /> Add Walk-in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ╔═══════════════════════════════════════════════════════════╗
  // ║  renderHistory                                           ║
  // ╚═══════════════════════════════════════════════════════════╝
  const renderHistory = () => {
    const servedEntries = history.filter((h) => h.status === "served");
    const noshowEntries = history.filter((h) => h.status === "noshow");
    const removedEntries = history.filter((h) => h.status === "removed");
    const cancelledEntries = history.filter((h) => h.status === "cancelled");
    const totalEntries = history.length;

    const completionRate =
      totalEntries > 0
        ? Math.round((servedEntries.length / totalEntries) * 100)
        : 0;
    const avgResolution = (() => {
      const durations = servedEntries
        .map((h) => parseInt(h.duration ?? "0"))
        .filter((n) => !isNaN(n));
      if (!durations.length) return "—";
      return `${Math.round(
        durations.reduce((a, b) => a + b, 0) / durations.length
      )} min`;
    })();

    const toggleSort = (col: string) => {
      if (hSortCol === col) setHSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setHSortCol(col);
        setHSortDir("asc");
      }
    };

    const filtered = [...history]
      .filter((h) => {
        const q = hSearch.toLowerCase();
        const ms =
          (h.user_name || "").toLowerCase().includes(q) ||
          (h.ticket_number || "").toLowerCase().includes(q) ||
          (h.service_type || "").toLowerCase().includes(q);
        const mv = hStatus === "all" || h.status === hStatus;
        const ml =
          hLevel === "all" ||
          (hLevel === "shs" && h.service_type === "General") ||
          (hLevel === "tertiary" && TERTIARY_PROGRAMS.includes(h.service_type));
        return ms && mv && ml;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (hSortCol === "name") {
          cmp = (a.user_name || "").localeCompare(b.user_name || "");
        }
        if (hSortCol === "ticket") {
          cmp = (a.ticket_number || "").localeCompare(b.ticket_number || "");
        }
        if (hSortCol === "status") {
          cmp = (a.status || "").localeCompare(b.status || "");
        }
        if (hSortCol === "time") {
          cmp = (a.appointment_time ?? "").localeCompare(
            b.appointment_time ?? ""
          );
        }
        return hSortDir === "asc" ? cmp : -cmp;
      });

    const filtersActive = hSearch || hStatus !== "all" || hLevel !== "all";

    const STATUS_CFG = {
      served: {
        label: "Served",
        color: "#4ade80",
        bg: "rgba(34,197,94,0.12)",
        border: "rgba(34,197,94,0.25)",
        icon: CheckCircle2,
      },
      noshow: {
        label: "No-Show",
        color: "#f87171",
        bg: "rgba(239,68,68,0.12)",
        border: "rgba(239,68,68,0.25)",
        icon: AlertOctagon,
      },
      removed: {
        label: "Removed",
        color: "#94a3b8",
        bg: "rgba(148,163,184,0.08)",
        border: "rgba(148,163,184,0.2)",
        icon: MinusCircle,
      },
      cancelled: {
        label: "Cancelled",
        color: "#fb923c",
        bg: "rgba(251,146,60,0.12)",
        border: "rgba(251,146,60,0.25)",
        icon: XCircle,
      },
    };

    const MiniBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
      <div
        style={{
          flex: 1,
          height: 6,
          background: "rgba(255,255,255,0.07)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min((value / max) * 100, 100)}%`,
            background: color,
            borderRadius: 99,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    );

    const SortTh = ({ col, children }: { col: string; children: React.ReactNode }) => {
      const active = hSortCol === col;
      return (
        <div
          onClick={() => toggleSort(col)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
            userSelect: "none",
            fontSize: 10,
            color: active ? "#93c5fd" : "rgba(255,255,255,0.3)",
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}
        >
          {children}
          <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <ChevronUp
              size={8}
              color={
                active && hSortDir === "asc"
                  ? "#60a5fa"
                  : "rgba(255,255,255,0.2)"
              }
            />
            <ChevronDownIcon
              size={8}
              color={
                active && hSortDir === "desc"
                  ? "#60a5fa"
                  : "rgba(255,255,255,0.2)"
              }
            />
          </span>
        </div>
      );
    };

    return (
      <div
        style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}
        className="fade-in"
      >
        {/* Analytics cards — 4 columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            className="card-shadow"
            style={{
              background: theme.bgCard,
              borderRadius: 16,
              border: `1px solid ${theme.borderCard}`,
              padding: 24,
              transition: "background 0.35s ease, border-color 0.35s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(34, 197, 94, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={20} color="#4ade80" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Completion Rate
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "white" }}>
                  {historyStats.completionRate}%
                </div>
              </div>
            </div>
          </div>
          <div
            className="card-shadow"
            style={{
              background: theme.bgCard,
              borderRadius: 16,
              border: `1px solid ${theme.borderCard}`,
              padding: 24,
              transition: "background 0.35s ease, border-color 0.35s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(56, 189, 248, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users size={20} color="#38bdf8" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Total Users Served
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "white" }}>
                  {historyStats.totalServed}
                </div>
              </div>
            </div>
          </div>
          <div
            className="card-shadow"
            style={{
              background: theme.bgCard,
              borderRadius: 16,
              border: `1px solid ${theme.borderCard}`,
              padding: 24,
              transition: "background 0.35s ease, border-color 0.35s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(248, 113, 113, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertOctagon size={20} color="#f87171" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  No-Show Rate
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "white" }}>
                  {historyStats.noShowRate}%
                </div>
              </div>
            </div>
          </div>
          {/* Bug 6 fix: avgResolution 4th analytics card */}
          <div
            className="card-shadow"
            style={{
              background: theme.bgCard,
              borderRadius: 16,
              border: `1px solid ${theme.borderCard}`,
              padding: 24,
              transition: "background 0.35s ease, border-color 0.35s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(251,191,36,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Clock size={20} color="#fbbf24" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Avg. Resolution
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "white" }}>
                  {avgResolution}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown bar */}
        <div
          style={{
            background: theme.bgCard,
            border: `1px solid ${theme.borderCard}`,
            borderRadius: 16,
            padding: "18px 22px",
            marginBottom: 16,
            transition: "background 0.35s ease, border-color 0.35s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart2 size={14} color="#a78bfa" />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                Today's Breakdown
              </span>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {totalEntries} total processed
            </span>
          </div>
          <div
            style={{
              display: "flex",
              height: 10,
              borderRadius: 99,
              overflow: "hidden",
              gap: 2,
              marginBottom: 14,
            }}
          >
            {totalEntries > 0 ? (
              [
                { count: servedEntries.length, color: "#22c55e" },
                { count: noshowEntries.length, color: "#ef4444" },
                { count: removedEntries.length, color: "#64748b" },
                { count: cancelledEntries.length, color: "#fb923c" },
              ]
                .filter((s) => s.count > 0)
                .map((seg, i) => (
                  <div
                    key={i}
                    style={{
                      flex: seg.count,
                      background: seg.color,
                      borderRadius: 99,
                    }}
                  />
                ))
            ) : (
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 99,
                }}
              />
            )}
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              {
                label: "Served",
                count: servedEntries.length,
                color: "#4ade80",
              },
              {
                label: "No-Show",
                count: noshowEntries.length,
                color: "#f87171",
              },
              {
                label: "Removed",
                count: removedEntries.length,
                color: "#64748b",
              },
              {
                label: "Cancelled",
                count: cancelledEntries.length,
                color: "#fb923c",
              },
            ].map((l) => (
              <div
                key={l.label}
                style={{ display: "flex", alignItems: "center", gap: 7 }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: l.color,
                  }}
                />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  {l.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 700,
                  }}
                >
                  {l.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Analytics Cards */}
        {history.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 16,
              marginBottom: 20,
            }}
          >
            {/* Service Type Demand */}
            <div
              style={{
                background: theme.bgCard,
                border: `1px solid ${theme.borderCard}`,
                borderRadius: 20,
                padding: "18px 20px",
                transition: "background 0.35s ease, border-color 0.35s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
                    Service Demand Breakdown
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    Volume by service category across all sessions
                  </div>
                </div>
                <BarChart2 size={16} color="#818cf8" />
              </div>
              <div style={{ width: "100%", height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(
                      history.reduce((acc, h) => {
                        const s = h.service_type || "General";
                        acc[s] = (acc[s] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([name, count]) => ({ name, count }))}
                    margin={{ top: 8, right: 12, left: -24, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: isRegistrar ? "#1b1234" : "#0f1936",
                        border: `1px solid ${theme.borderCard}`,
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#818cf8" }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {Object.entries(
                        history.reduce((acc, h) => {
                          const s = h.service_type || "General";
                          acc[s] = (acc[s] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#818cf8", "#38bdf8", "#34d399", "#f59e0b", "#c084fc"][index % 5]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Throughput */}
            <div
              style={{
                background: theme.bgCard,
                border: `1px solid ${theme.borderCard}`,
                borderRadius: 20,
                padding: "18px 20px",
                transition: "background 0.35s ease, border-color 0.35s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
                    Department Throughput
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    Cashier vs Registrar resolution breakdown
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: "#34d399", display: "inline-block" }} /> Served
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: "#f87171", display: "inline-block" }} /> No-Show
                  </span>
                </div>
              </div>
              <div style={{ width: "100%", height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        dept: "Cashier",
                        served: history.filter((h) => h.department === "Cashier" && h.status === "served").length,
                        noshow: history.filter((h) => h.department === "Cashier" && h.status === "noshow").length,
                      },
                      {
                        dept: "Registrar",
                        served: history.filter((h) => h.department === "Registrar" && h.status === "served").length,
                        noshow: history.filter((h) => h.department === "Registrar" && h.status === "noshow").length,
                      },
                    ]}
                    margin={{ top: 8, right: 12, left: -24, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="dept" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: isRegistrar ? "#1b1234" : "#0f1936",
                        border: `1px solid ${theme.borderCard}`,
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="served" name="Served" fill="#34d399" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="noshow" name="No-Show" fill="#f87171" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* History table */}
        <div
          style={{
            background: theme.bgCard,
            border: `1px solid ${theme.borderCard}`,
            borderRadius: 20,
            overflow: "hidden",
            transition: "background 0.35s ease, border-color 0.35s ease",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 4 }}>
              <History size={14} color="#a78bfa" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                Session Log
              </span>
              <div style={{
                background: "rgba(167,139,250,0.2)",
                border: "1px solid rgba(167,139,250,0.3)",
                borderRadius: 99, padding: "2px 9px",
                fontSize: 11, color: "#c4b5fd", fontWeight: 700,
              }}>
                {history.length}
              </div>
            </div>
            {/* Feature 2: CSV export button */}
            <button
              className="ctrl-btn"
              onClick={handleExportCSV}
              disabled={!history.length}
              title="Export history as CSV"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 13px", borderRadius: 9,
                background: history.length ? "rgba(52,211,153,0.1)" : "rgba(52,211,153,0.04)",
                border: "1px solid rgba(52,211,153,0.2)",
                color: history.length ? "#34d399" : "rgba(52,211,153,0.3)",
                fontSize: 12, fontWeight: 700,
                cursor: history.length ? "pointer" : "not-allowed",
                fontFamily: "'Outfit',sans-serif",
                marginLeft: "auto",
              }}
            >
              <FileDown size={13} /> Export CSV
            </button>
            <div style={{ position: "relative", flex: "1 1 180px" }}>
              <Search
                size={13}
                color="rgba(255,255,255,0.3)"
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                value={hSearch}
                onChange={(e) => setHSearch(e.target.value)}
                placeholder="Search name, ticket, program…"
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 32px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "white",
                  fontSize: 13,
                  fontFamily: "'Outfit',sans-serif",
                }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <Filter
                size={12}
                color="rgba(255,255,255,0.3)"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <select
                className="filter-sel"
                value={hStatus}
                onChange={(e) => setHStatus(e.target.value)}
                style={{
                  padding: "9px 28px 9px 28px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(15,25,60,0.95)",
                  color: hStatus !== "all" ? "white" : "rgba(255,255,255,0.45)",
                  fontSize: 12,
                  fontFamily: "'Outfit',sans-serif",
                  minWidth: 138,
                }}
              >
                <option value="all">All Statuses</option>
                <option value="served">Served</option>
                <option value="noshow">No-Show</option>
                <option value="removed">Removed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDownIcon
                size={12}
                color="rgba(255,255,255,0.3)"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <SlidersHorizontal
                size={12}
                color="rgba(255,255,255,0.3)"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <select
                className="filter-sel"
                value={hLevel}
                onChange={(e) => setHLevel(e.target.value)}
                style={{
                  padding: "9px 28px 9px 28px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(15,25,60,0.95)",
                  color: hLevel !== "all" ? "white" : "rgba(255,255,255,0.45)",
                  fontSize: 12,
                  fontFamily: "'Outfit',sans-serif",
                  minWidth: 138,
                }}
              >
                <option value="all">All Levels</option>
                <option value="shs">Senior High</option>
                <option value="tertiary">College</option>
              </select>
              <ChevronDownIcon
                size={12}
                color="rgba(255,255,255,0.3)"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>
            {filtersActive && (
              <button
                onClick={() => {
                  setHSearch("");
                  setHStatus("all");
                  setHLevel("all");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                <X size={11} /> Clear
              </button>
            )}
          </div>

          {/* Column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 72px 1fr 140px 120px 100px 90px",
              padding: "10px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}
            >
              #
            </div>
            <SortTh col="ticket">TICKET</SortTh>
            <SortTh col="name">USER</SortTh>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}
            >
              PROGRAM
            </div>
            <SortTh col="status">STATUS</SortTh>
            <SortTh col="time">TIME</SortTh>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}
            >
              DURATION
            </div>
          </div>

          {/* Rows */}
          <div style={{ maxHeight: 440, overflowY: "auto" }}>
            {history.length === 0 ? (
              <div
                style={{
                  padding: "32px",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                No history logs available.
              </div>
            ) : (
            // Bug 3 fix: iterate filtered (respects search + filters), not history (shows all)
              filtered.map((log, i) => (
                <div
                  key={log.id || i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 180px 140px 100px",
                    gap: 16,
                    padding: "16px 24px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.9)",
                      fontSize: 13,
                    }}
                  >
                    {log.ticket_number || log.ticket}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      {log.user_name || log.name}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}
                    >
                      {log.service_type}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    {new Date(
                      log.created_at || Date.now()
                    ).toLocaleDateString()}{" "}
                    · {log.appointment_time || log.time}
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: log.department === "Registrar" ? "#c084fc" : "#93c5fd",
                        background: log.department === "Registrar" ? "rgba(139,92,246,0.15)" : "rgba(37,99,235,0.15)",
                        border: log.department === "Registrar" ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(37,99,235,0.2)",
                        borderRadius: 6,
                        padding: "4px 8px",
                      }}
                    >
                      {log.department}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 99,
                        ...(log.status === "served"
                          ? {
                              background: "rgba(16,185,129,0.15)",
                              color: "#34d399",
                              border: "1px solid rgba(16,185,129,0.2)",
                            }
                          : log.status === "noshow"
                          ? {
                              background: "rgba(239,68,68,0.15)",
                              color: "#f87171",
                              border: "1px solid rgba(239,68,68,0.2)",
                            }
                          : log.status === "cancelled"
                          ? {
                              background: "rgba(251,146,60,0.15)",
                              color: "#fb923c",
                              border: "1px solid rgba(251,146,60,0.2)",
                            }
                          : {
                              background: "rgba(100,116,139,0.15)",
                              color: "#94a3b8",
                              border: "1px solid rgba(100,116,139,0.2)",
                            }),
                      }}
                    >
                      {log.status === "served"
                        ? "SERVED"
                        : log.status === "noshow"
                        ? "NO-SHOW"
                        : log.status === "cancelled"
                        ? "CANCELLED"
                        : "REMOVED"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "11px 20px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              Showing{" "}
              <strong style={{ color: "rgba(255,255,255,0.6)" }}>
                {filtered.length}
              </strong>{" "}
              of{" "}
              <strong style={{ color: "rgba(255,255,255,0.6)" }}>
                {history.length}
              </strong>{" "}
              log entries
            </span>
            <div style={{ display: "flex", gap: 16 }}>
              {[
                {
                  label: "Served",
                  count: filtered.filter((h) => h.status === "served").length,
                  color: "#4ade80",
                },
                {
                  label: "No-Show",
                  count: filtered.filter((h) => h.status === "noshow").length,
                  color: "#f87171",
                },
                {
                  label: "Removed",
                  count: filtered.filter((h) => h.status === "removed").length,
                  color: "#64748b",
                },
              ].map((l) => (
                <div
                  key={l.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 2,
                      background: l.color,
                    }}
                  />
                  {l.label}:{" "}
                  <strong
                    style={{ color: "rgba(255,255,255,0.6)", marginLeft: 2 }}
                  >
                    {l.count}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ╔═══════════════════════════════════════════════════════════╗
  // ║  renderSettings                                          ║
  // ╚═══════════════════════════════════════════════════════════╝
  const renderSettings = () => {
    const SectionCard = ({
      icon: Icon,
      iconColor,
      iconBg,
      iconBorder,
      title,
      subtitle,
      children,
    }: {
      icon: React.ElementType;
      iconColor: string;
      iconBg: string;
      iconBorder: string;
      title: string;
      subtitle?: string;
      children: React.ReactNode;
    }) => (
      <div
        style={{
          background: theme.bgCard,
          border: `1px solid ${theme.borderCard}`,
          borderRadius: 18,
          overflow: "hidden",
          marginBottom: 16,
          transition: "background 0.35s ease, border-color 0.35s ease",
        }}
      >
        <div
          style={{
            padding: "18px 24px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: iconBg,
              border: `1px solid ${iconBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={17} color={iconColor} />
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                  marginTop: 2,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: "6px 0 8px" }}>{children}</div>
      </div>
    );

    const SettingRow = ({ label, hint, children, noBorder }: { label: string; hint?: React.ReactNode; children: React.ReactNode; noBorder?: boolean }) => (
      <div
        className="settings-row"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: noBorder ? "none" : "1px solid rgba(255,255,255,0.04)",
          gap: 24,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {label}
          </div>
          {hint && (
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                marginTop: 3,
                lineHeight: 1.5,
              }}
            >
              {hint}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
      </div>
    );

    const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
      <div
        className="toggle-track"
        onClick={() => onChange(!value)}
        style={{
          width: 46,
          height: 26,
          borderRadius: 99,
          background: value ? theme.toggleActive : "rgba(255,255,255,0.1)",
          border: `1px solid ${
            value ? theme.toggleBorder : "rgba(255,255,255,0.12)"
          }`,
          position: "relative",
          boxShadow: value ? `0 0 12px ${theme.primaryGlow}` : "none",
        }}
      >
        <div
          className="toggle-thumb"
          style={{
            position: "absolute",
            top: 3,
            left: value ? 23 : 3,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: value ? "white" : "rgba(255,255,255,0.4)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        />
      </div>
    );

    const NumInput = ({ value, onChange, min, max, unit }: { value: number; onChange: (v: number) => void; min: number; max: number; unit?: string }) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => onChange(Math.max(min, value - 1))}
            style={{
              width: 32,
              height: 38,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            −
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 14px",
            }}
          >
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 16,
                fontWeight: 700,
                color: "white",
                minWidth: 28,
                textAlign: "center",
              }}
            >
              {value}
            </span>
            {unit && (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {unit}
              </span>
            )}
          </div>
          <button
            onClick={() => onChange(Math.min(max, value + 1))}
            style={{
              width: 32,
              height: 38,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            +
          </button>
        </div>
      </div>
    );

    const StyledSelect = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="filter-sel"
          style={{
            padding: "9px 36px 9px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            fontSize: 13,
            fontFamily: "'Outfit',sans-serif",
            minWidth: 160,
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          size={13}
          color="rgba(255,255,255,0.4)"
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
      </div>
    );

    return (
      <div
        style={{ flex: 1, overflowY: "auto", padding: "20px 24px 40px" }}
        className="fade-in"
      >
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          {/* Queue Configuration */}
          <SectionCard
            icon={Sliders}
            iconColor="#60a5fa"
            iconBg="rgba(59,130,246,0.12)"
            iconBorder="rgba(59,130,246,0.25)"
            title="Queue Configuration"
            subtitle="Control how the live queue behaves during appointment sessions"
          >
            <SettingRow
              label="Grace Period Duration"
              hint="Time a user has to reach the window after being called before being flagged as absent."
            >
              <NumInput
                value={sGrace}
                onChange={(v) => {
                  setSGrace(v);
                  setGraceByDept((prev) => ({
                    Cashier: { ...prev.Cashier, time: prev.Cashier.active ? prev.Cashier.time : v },
                    Registrar: { ...prev.Registrar, time: prev.Registrar.active ? prev.Registrar.time : v },
                  }));
                }}
                min={5}
                max={60}
                unit="sec"
              />
            </SettingRow>
            <SettingRow
              label="Active Terminal / Window"
              hint="Switch windows quickly from the header bar at the top of any page."
            >
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontStyle: "italic",
                }}
              >
                {sWindow === "1" ? "Window 1 — Cashier" : "Window 2 — Registrar"}
                <span style={{ marginLeft: 8, opacity: 0.5 }}>↑ Use header switcher</span>
              </div>
            </SettingRow>
            <SettingRow
              label="Maximum Queue Capacity"
              hint="Users will be prevented from booking once this limit is reached."
            >
              <NumInput
                value={sMaxQueue}
                onChange={setSMaxQueue}
                min={10}
                max={200}
                unit="users"
              />
            </SettingRow>
            <SettingRow
              label="Auto-Advance After No-Show"
              hint="Automatically call the next user once a no-show is confirmed, without manual intervention."
              noBorder
            >
              <Toggle value={sAutoAdvance} onChange={setSAutoAdvance} />
            </SettingRow>
          </SectionCard>

          {/* Hardware & Audio Integration */}
          <SectionCard
            icon={Cpu}
            iconColor="#a78bfa"
            iconBg="rgba(167,139,250,0.1)"
            iconBorder="rgba(167,139,250,0.25)"
            title="Hardware & Audio Integration"
            subtitle="Connect physical devices and audio alerts to enhance queue operations"
          >
            <SettingRow
              label="Physical Paper Ticket Printer"
              hint={
                <span>
                  Prints a paper ticket stub when a walk-in user is added to
                  the queue.
                  {!sPrinter && (
                    <span
                      style={{ color: "rgba(255,255,255,0.3)", marginLeft: 6 }}
                    >
                      ● Inactive
                    </span>
                  )}
                  {sPrinter && (
                    <span style={{ color: "#4ade80", marginLeft: 6 }}>
                      ● Active
                    </span>
                  )}
                </span>
              }
            >
              <Toggle value={sPrinter} onChange={setSPrinter} />
            </SettingRow>
            <SettingRow
              label="Audio Chimes & Bell Notifications"
              hint={
                <span>
                  Synthesizes chime chimes when calling tickets, grace alerts fire, or sessions complete.
                  {!sAudio && (
                    <span
                      style={{ color: "rgba(255,255,255,0.3)", marginLeft: 6 }}
                    >
                      ● Muted
                    </span>
                  )}
                  {sAudio && (
                    <span style={{ color: "#4ade80", marginLeft: 6 }}>
                      ● Enabled
                    </span>
                  )}
                </span>
              }
              noBorder
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => triggerChime("call")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 7,
                    background: "rgba(167,139,250,0.15)",
                    border: "1px solid rgba(167,139,250,0.3)",
                    color: "#c4b5fd",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: "'Outfit',sans-serif",
                  }}
                  title="Test Chime Sound"
                >
                  <Volume2 size={12} /> Test Chime
                </button>
                <Toggle value={sAudio} onChange={setSAudio} />
              </div>
            </SettingRow>
          </SectionCard>

          {/* Account Details */}
          <SectionCard
            icon={User}
            iconColor="#fbbf24"
            iconBg="rgba(251,191,36,0.1)"
            iconBorder="rgba(251,191,36,0.2)"
            title="Account Details"
            subtitle="Your administrator profile and security settings"
          >
            <div
              style={{
                padding: "20px 24px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "white",
                    letterSpacing: "-0.02em",
                    boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: "white",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {displayName}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.45)",
                      marginTop: 3,
                    }}
                  >
                    Registrar · SASCHED Platform
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#60a5fa",
                        background: "rgba(59,130,246,0.12)",
                        border: "1px solid rgba(59,130,246,0.25)",
                        borderRadius: 6,
                        padding: "3px 9px",
                      }}
                    >
                      Administrator
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#4ade80",
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        borderRadius: 6,
                        padding: "3px 9px",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "#22c55e",
                        }}
                      />{" "}
                      Active Session
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <SettingRow
              label="Email Address"
              hint="Used for system notifications and password recovery."
            >
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "'Space Mono',monospace",
                }}
              >
                {userEmail}
              </span>
            </SettingRow>
            <SettingRow
              label="Role"
              hint="Your permission level within the SAS system."
            >
              <span
                style={{
                  fontSize: 12, fontWeight: 700, color: "#a78bfa",
                  background: "rgba(167,139,250,0.1)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  borderRadius: 8, padding: "5px 12px",
                }}
              >
                Registrar Admin
              </span>
            </SettingRow>
            {/* Bug 3 fix: button to open Change Password modal */}
            <SettingRow
              label="Password"
              hint="Update your login credentials securely."
              noBorder
            >
              <button
                onClick={() => { setSPwModal(true); setPwError(null); setPwSuccess(false); }}
                className="ctrl-btn"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 10,
                  border: "1px solid rgba(52,211,153,0.25)",
                  background: "rgba(52,211,153,0.08)",
                  color: "#34d399", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "'Outfit',sans-serif",
                }}
              >
                <KeyRound size={13} /> Change Password
              </button>
            </SettingRow>
          </SectionCard>

          {/* Save bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 24px",
              background: theme.bgCard,
              border: `1px solid ${theme.borderCard}`,
              borderRadius: 18,
              transition: "background 0.35s ease, border-color 0.35s ease",
            }}
          >
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              Changes are applied immediately after saving.
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {settingsSaved && (
                <div
                  className="save-toast"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "#4ade80",
                    fontWeight: 600,
                  }}
                >
                  <CheckCheck size={14} /> Saved successfully
                </div>
              )}
              <button
                className="ctrl-btn"
                onClick={() => {
                  setSGrace(15);
                  setGraceByDept({
                    Cashier: { active: false, time: 15, warning: false },
                    Registrar: { active: false, time: 15, warning: false },
                  });
                  setSWindow("1");
                  setSPrinter(false);
                  setSMaxQueue(50);
                  setSAutoAdvance(false);
                  setSAudio(true);
                  // Bug 5 fix: also clear localStorage
                  localStorage.removeItem("admin_sGrace");
                  localStorage.removeItem("admin_sWindow");
                  localStorage.removeItem("admin_sPrinter");
                  localStorage.removeItem("admin_sMaxQueue");
                  localStorage.removeItem("admin_sAutoAdvance");
                  localStorage.removeItem("admin_sAudio");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  borderRadius: 11,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                <RotateCw size={13} /> Reset Defaults
              </button>
              <button
                className="ctrl-btn"
                onClick={saveSettings}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 22px",
                  borderRadius: 11,
                  border: "none",
                  background: theme.primaryGradient,
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                  boxShadow: `0 6px 20px ${theme.primaryGlow}`,
                }}
              >
                <CheckCheck size={14} /> Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {sPwModal && (
          <div
            className="modal-backdrop"
            onClick={() => setSPwModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              className="slide-in"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "linear-gradient(145deg,#0f2057,#0d1a40)",
                border: "1px solid rgba(52,211,153,0.25)",
                borderRadius: 22,
                padding: "30px",
                width: 400,
                boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      background: "rgba(52,211,153,0.1)",
                      border: "1px solid rgba(52,211,153,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <KeyRound size={17} color="#34d399" />
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 15, fontWeight: 800, color: "white" }}
                    >
                      Change Password
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                        marginTop: 1,
                      }}
                    >
                      {displayName} · {activeDepartment}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSPwModal(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={15} color="rgba(255,255,255,0.5)" />
                </button>
              </div>
              {/* Bug 3 fix: wired inputs with state + validation feedback */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", marginBottom: 7, letterSpacing: "0.06em" }}>
                  CURRENT PASSWORD
                </label>
                <input
                  type="password"
                  value={pwCurrent}
                  onChange={(e) => setPwCurrent(e.target.value)}
                  placeholder="Enter current password"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: 14, fontFamily: "'Outfit',sans-serif" }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", marginBottom: 7, letterSpacing: "0.06em" }}>
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  placeholder="Min. 8 characters"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${pwError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`, background: "rgba(255,255,255,0.05)", color: "white", fontSize: 14, fontFamily: "'Outfit',sans-serif" }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", marginBottom: 7, letterSpacing: "0.06em" }}>
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  placeholder="Re-enter new password"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${pwError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`, background: "rgba(255,255,255,0.05)", color: "white", fontSize: 14, fontFamily: "'Outfit',sans-serif" }}
                />
              </div>
              {pwError && (
                <div style={{ fontSize: 12, color: "#f87171", marginBottom: 8, padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}>
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div style={{ fontSize: 12, color: "#4ade80", marginBottom: 8, padding: "8px 12px", background: "rgba(34,197,94,0.1)", borderRadius: 8, border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCheck size={13} /> Password updated successfully!
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <button
                  onClick={() => { setSPwModal(false); setPwError(null); setPwCurrent(""); setPwNew(""); setPwConfirm(""); }}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 11,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.6)", fontSize: 13,
                    fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={pwLoading || pwSuccess}
                  className="ctrl-btn"
                  style={{
                    flex: 2, padding: "12px", borderRadius: 11, border: "none",
                    background: pwSuccess
                      ? "linear-gradient(135deg,#16a34a,#15803d)"
                      : "linear-gradient(135deg,#059669,#047857)",
                    color: "white", fontSize: 13, fontWeight: 700,
                    cursor: pwLoading ? "not-allowed" : "pointer",
                    fontFamily: "'Outfit',sans-serif",
                    boxShadow: "0 6px 20px rgba(5,150,105,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    opacity: pwLoading ? 0.7 : 1,
                  }}
                >
                  {pwLoading ? (
                    <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  {pwSuccess ? "Updated!" : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ╔═══════════════════════════════════════════════════════════╗
  // ║  GATEKEEPER — auth check before rendering anything       ║
  // ╚═══════════════════════════════════════════════════════════╝

  // Still waiting for Supabase to respond — show a neutral spinner
  if (!authReady) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1526",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            border: "3px solid rgba(59,130,246,0.2)",
            borderTop: "3px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // No valid session — show login screen
  if (!session) {
    return <AdminLogin onLogin={() => {}} />;
    // onLogin is a no-op: onAuthStateChange handles the state update automatically
  }

  // ── GAP 1 FIX: Role guard — only users with app_metadata.role === "admin" may proceed ──
  // Set this in Supabase Dashboard → Auth → Users → Edit → app_metadata: { "role": "admin" }
  const isAdmin = session.user?.app_metadata?.role === "admin";
  if (!isAdmin) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1526",
          gap: 16,
          fontFamily: "'Outfit',sans-serif",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <ShieldAlert size={36} color="#f87171" />
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
          Unauthorized Access
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", maxWidth: 360, lineHeight: 1.6 }}>
          Your account does not possess administrator privileges. Please contact your system administrator to assign the admin role to your credentials.
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setSession(null);
          }}
          className="ctrl-btn"
          style={{
            marginTop: 12,
            padding: "11px 24px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          <LogOut size={14} /> Back to Login
        </button>
      </div>
    );
  }

  // ╔═══════════════════════════════════════════════════════════╗
  // ║  ROOT RENDER  (session confirmed)                        ║
  // ╚═══════════════════════════════════════════════════════════╝
  return (
    <div
      style={{
        fontFamily: "'Outfit','DM Sans',sans-serif",
        height: "100vh",
        display: "flex",
        background: theme.bgRoot,
        transition: "background 0.35s ease",
        overflow: "hidden",
        ["--focus-ring" as string]: theme.primaryGlow,
        ["--hover-glow" as string]: theme.bgCardSubtle,
      }}
    >
      <style>{CSS}</style>

      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <aside
        style={{
          width: sidebarCollapsed ? 64 : 220,
          flexShrink: 0,
          background: theme.bgSidebar,
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(.22,.68,0,1.2), background 0.35s ease",
          overflow: "hidden",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: "18px 16px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            minHeight: 64,
          }}
        >
          {/* Custom Logo Image */}
          <img
            src="/logo.png"
            alt="SAS Logo"
            style={{
              width: 36,
              height: 36,
              objectFit: "contain",
              borderRadius: 8,
              flexShrink: 0,
            }}
          />
          {!sidebarCollapsed && (
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: "white",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                SAS Admin
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  whiteSpace: "nowrap",
                }}
              >
                SASCHED Platform
              </div>
            </div>
          )}
        </div>
        <nav
          style={{
            flex: 1,
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {navItems.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                className="nav-btn"
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 10px",
                  borderRadius: 10,
                  background: active ? theme.activeNavBg : "transparent",
                  border: active
                    ? `1px solid ${theme.activeNavBorder}`
                    : "1px solid transparent",
                }}
              >
                <item.icon
                  size={17}
                  color={active ? theme.activeNavColor : "rgba(255,255,255,0.4)"}
                  style={{ flexShrink: 0 }}
                />
                {!sidebarCollapsed && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: active ? theme.primaryLight : "rgba(255,255,255,0.5)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>
                )}
                {!sidebarCollapsed && active && (
                  <ChevronRight
                    size={13}
                    color={theme.activeNavColor}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </button>
            );
          })}
        </nav>
        <div
          style={{
            padding: "12px 8px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {!sidebarCollapsed && (
            <div
              style={{
                padding: "10px 10px",
                marginBottom: 6,
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 6,
                  letterSpacing: "0.06em",
                }}
              >
                ADMIN
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {displayName}
                  </div>
                  <div
                    style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}
                  >
                    {activeDepartment}
                  </div>
                </div>
              </div>
            </div>
          )}
          <button
            className="nav-btn"
            onClick={() => setSidebarCollapsed((c) => !c)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "9px",
              borderRadius: 9,
            }}
          >
            <ChevronRight
              size={15}
              color="rgba(255,255,255,0.3)"
              style={{
                transform: sidebarCollapsed ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s ease",
              }}
            />
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            height: 64,
            flexShrink: 0,
            background: theme.bgHeader,
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            gap: 16,
            transition: "background 0.35s ease",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "white",
                letterSpacing: "-0.01em",
              }}
            >
              {navItems.find((n) => n.id === activeNav)?.label}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              {new Date().toLocaleDateString("en-PH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* ── Active Window Switcher (moved from Settings for quick access) ── */}
            {!showLogoutConfirm && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: 4,
                  gap: 3,
                }}
              >
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.05em", paddingLeft: 6, paddingRight: 2 }}>WINDOW</span>
                {(["1", "2"] as const).map((w) => {
                  const label = w === "1" ? "Cashier" : "Registrar";
                  const isActive = sWindow === w;
                  return (
                    <button
                      key={w}
                      onClick={() => {
                        setSWindow(w);
                        localStorage.setItem("admin_sWindow", w);
                      }}
                      style={{
                        padding: "5px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: isActive
                          ? w === "1" ? "rgba(59,130,246,0.8)" : "rgba(139,92,246,0.8)"
                          : "transparent",
                        color: isActive ? "white" : "rgba(255,255,255,0.4)",
                        fontSize: 12,
                        fontWeight: isActive ? 700 : 500,
                        cursor: "pointer",
                        fontFamily: "'Outfit',sans-serif",
                        transition: "all 0.18s ease",
                        boxShadow: isActive
                          ? w === "1" ? "0 2px 10px rgba(59,130,246,0.4)" : "0 2px 10px rgba(139,92,246,0.4)"
                          : "none",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
            {showLogoutConfirm ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Log out?</span>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "5px 12px", borderRadius: 8, border: "none",
                    background: "rgba(239,68,68,0.8)", color: "white",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    padding: "5px 12px", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                title="Log Out"
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <LogOut size={15} color="rgba(255,255,255,0.6)" />
              </button>
            )}
          </div>
        </header>

        {/* Routed views */}
        {activeNav === "dashboard" && renderDashboard()}
        {activeNav === "queue" && renderLiveQueue()}
        {activeNav === "history" && renderHistory()}
        {activeNav === "settings" && renderSettings()}
      </div>

      {/* ── CLEAR QUEUE CONFIRM MODAL (Feature 1) ─────────────── */}
      {showClearConfirm && (
        <div
          onClick={() => setShowClearConfirm(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 150, backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="slide-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(145deg,#0f2057,#0d1a40)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 20, padding: "30px", width: 380,
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <TrashIcon size={19} color="#f87171" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>Clear Queue</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  {activeDepartment} window · {activeWindowQueue.length} ticket{activeWindowQueue.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div style={{
              fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6,
              background: "rgba(239,68,68,0.08)", borderRadius: 10,
              padding: "12px 14px", marginBottom: 20,
              border: "1px solid rgba(239,68,68,0.15)",
            }}>
              This will mark all <strong style={{ color: "#f87171" }}>{activeWindowQueue.length} waiting ticket{activeWindowQueue.length !== 1 ? "s" : ""}</strong> in the <strong>{activeDepartment}</strong> window as <strong>Removed</strong>. This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1, padding: "11px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.6)", fontSize: 13,
                  fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearQueue}
                disabled={clearingQueue}
                className="ctrl-btn"
                style={{
                  flex: 2, padding: "11px", borderRadius: 10, border: "none",
                  background: clearingQueue ? "rgba(239,68,68,0.4)" : "linear-gradient(135deg,#dc2626,#b91c1c)",
                  color: "white", fontSize: 13, fontWeight: 700,
                  cursor: clearingQueue ? "not-allowed" : "pointer",
                  fontFamily: "'Outfit',sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  boxShadow: "0 6px 20px rgba(220,38,38,0.35)",
                }}
              >
                {clearingQueue ? (
                  <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                ) : (
                  <TrashIcon size={14} />
                )}
                {clearingQueue ? "Clearing…" : "Clear All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WALK-IN MODAL ─────────────────────────────────────────── */}
      {walkInModal && (
        <div
          className="modal-backdrop"
          onClick={() => setWalkInModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="slide-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme.terminalBg,
              border: `1px solid ${theme.terminalBorder}`,
              borderRadius: 22,
              padding: "28px",
              width: 400,
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 22,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "white",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Add Walk-in User
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    marginTop: 2,
                  }}
                >
                  Insert user directly into the queue
                </div>
              </div>
              <button
                onClick={() => setWalkInModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={15} color="rgba(255,255,255,0.5)" />
              </button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 700,
                color: "rgba(255,255,255,0.5)", marginBottom: 7,
                letterSpacing: "0.06em",
              }}>
                FULL NAME
              </label>
              <input
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                placeholder="e.g. Juan dela Cruz"
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)", color: "white",
                  fontSize: 14, fontFamily: "'Outfit',sans-serif",
                }}
              />
            </div>
            {/* Feature 4: Department selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 700,
                color: "rgba(255,255,255,0.5)", marginBottom: 7,
                letterSpacing: "0.06em",
              }}>
                WINDOW / DEPARTMENT
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["Cashier", "Registrar"].map((dept) => {
                  const isSel = walkInDepartment === dept;
                  const isReg = dept === "Registrar";
                  return (
                    <button
                      key={dept}
                      onClick={() => setWalkInDepartment(dept)}
                      style={{
                        padding: "9px 14px", borderRadius: 9, cursor: "pointer",
                        fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 700,
                        background: isSel
                          ? (isReg ? "rgba(167,139,250,0.2)" : "rgba(37,99,235,0.25)")
                          : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isSel
                          ? (isReg ? "rgba(167,139,250,0.5)" : "rgba(59,130,246,0.6)")
                          : "rgba(255,255,255,0.1)"}`,
                        color: isSel
                          ? (isReg ? "#c4b5fd" : "#93c5fd")
                          : "rgba(255,255,255,0.45)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 7,
                  letterSpacing: "0.06em",
                }}
              >
                SERVICE TYPE
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={walkInPurpose}
                  onChange={(e) => setWalkInPurpose(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 32px 11px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(15,25,60,0.95)",
                    color: walkInPurpose ? "white" : "rgba(255,255,255,0.3)",
                    fontSize: 14,
                    fontFamily: "'Outfit',sans-serif",
                    appearance: "none",
                  }}
                >
                  <option value="">Select purpose…</option>
                  {PURPOSE_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  color="rgba(255,255,255,0.3)"
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
            {/* Error display (Bug B fix) */}
            {walkInError && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#f87171", lineHeight: 1.5 }}>
                ⚠ {walkInError}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setWalkInModal(false); setWalkInError(null); }}
                style={{ flex: 1, padding: "12px", borderRadius: 11, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={addWalkIn}
                disabled={!walkInName || walkInLoading}
                className="ctrl-btn"
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: 11,
                  border: "none",
                  background: (!walkInName || walkInLoading)
                    ? (isRegistrar ? "rgba(124,58,237,0.2)" : "rgba(37,99,235,0.2)")
                    : theme.primaryGradient,
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: (walkInName && !walkInLoading) ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontFamily: "'Outfit',sans-serif",
                  boxShadow: (walkInName && !walkInLoading) ? `0 6px 20px ${theme.primaryGlow}` : "none",
                }}
              >
                {walkInLoading ? (
                  <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Adding…</>
                ) : (
                  <><UserPlus size={14} /> Add to Queue</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Printable Paper Ticket Stub Modal ── */}
      {printedTicket && (
        <div
          className="modal-backdrop"
          onClick={() => setPrintedTicket(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 350,
            padding: 16,
          }}
        >
          <div
            className="slide-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 360,
              background: isRegistrar ? "#180f33" : "#0d1526",
              borderRadius: 20,
              border: `1px solid ${isRegistrar ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.12)"}`,
              boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}
          >
            {/* Header bar */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Printer size={16} color="#38bdf8" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                  Ticket Printed Successfully
                </span>
              </div>
              <button
                onClick={() => setPrintedTicket(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Thermal Slip Content */}
            <div style={{ padding: "20px 24px" }}>
              <div
                id="printable-slip"
                style={{
                  background: "#ffffff",
                  color: "#0f172a",
                  borderRadius: 14,
                  padding: "24px 20px 20px",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                  fontFamily: "'Outfit', sans-serif",
                  textAlign: "center",
                  border: "1px dashed #cbd5e1",
                  position: "relative",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "#64748b", textTransform: "uppercase" }}>
                  SASCHED Queue System
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                  {printedTicket.department === "Cashier" ? "Window 1 — Cashier" : "Window 2 — Registrar"}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} · {printedTicket.time}
                </div>

                <div style={{ margin: "16px 0", borderTop: "2px dashed #e2e8f0", borderBottom: "2px dashed #e2e8f0", padding: "14px 0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Your Ticket Number
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 34,
                      fontWeight: 800,
                      color: "#1e293b",
                      letterSpacing: "0.04em",
                      marginTop: 4,
                    }}
                  >
                    {printedTicket.ticket}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", marginTop: 4 }}>
                    Walk-in Client
                  </div>
                </div>

                <div style={{ textAlign: "left", fontSize: 12, lineHeight: 1.8, color: "#334155", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Client Name:</span>
                    <strong style={{ color: "#0f172a" }}>{printedTicket.name}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Service Purpose:</span>
                    <strong style={{ color: "#0f172a" }}>{printedTicket.service_type}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Counter Window:</span>
                    <strong style={{ color: "#0f172a" }}>{printedTicket.department}</strong>
                  </div>
                </div>

                {/* Decorative barcode */}
                <div style={{ display: "flex", justifyContent: "center", gap: 3, height: 28, opacity: 0.7, marginBottom: 8 }}>
                  {[2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 4, 2, 5, 1, 3, 2, 4, 2, 1, 3, 4, 2, 5, 2].map((w, i) => (
                    <div key={i} style={{ width: w, height: "100%", background: "#0f172a" }} />
                  ))}
                </div>
                <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: "#94a3b8", letterSpacing: "0.15em" }}>
                  * {printedTicket.ticket} *
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                padding: "14px 20px 20px",
                display: "flex",
                gap: 10,
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <button
                onClick={() => setPrintedTicket(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="ctrl-btn"
                style={{
                  flex: 1.5,
                  padding: "10px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #0284c7, #0369a1)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: "0 4px 16px rgba(2,132,199,0.3)",
                }}
              >
                <Printer size={14} /> Print Stub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
