import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import {
  LayoutDashboard, Users, History, Settings, GraduationCap,
  ChevronRight, Bell, LogOut, UserPlus, SkipForward, RotateCcw,
  PauseCircle, PlayCircle, X, Clock, CheckCircle2, AlertTriangle,
  Monitor, ChevronDown, Trash2, ZapOff, Zap,
  ShieldAlert, Search, SlidersHorizontal,
  ArrowUpDown, Filter,
  BarChart2, TimerReset, Percent,
  AlertOctagon, MinusCircle, ChevronUp, ChevronDown as ChevronDownIcon,
  Printer, User, KeyRound, ShieldCheck, Sliders,
  CheckCheck, RotateCw, Cpu
} from "lucide-react";

// ─── PROGRAM CONSTANTS ────────────────────────────────────────────────────────
const SHS_PROGRAMS = [
  "ABM",
  "STEM",
  "IT in Mobile App and Web Development",
  "Culinary Arts",
];
const TERTIARY_PROGRAMS = [
  "BSIT",
  "BSCpE",
  "BSBA",
  "BSHM",
  "BMMA",
  "BSTM",
];

// ─── DUMMY DATA (queue is now live from Supabase) ─────────────────────────────
const INITIAL_SERVING = {
  ticket: "A-047", name: "Maria Santos", course: "BSIT",
  time: "9:00 AM", type: "booked", calledAt: null,
};

const HISTORY_LOG = [
  { ticket: "A-044", name: "Felix Aquino",    course: "BSCpE", status: "served",  time: "8:42 AM", duration: "4 min" },
  { ticket: "A-045", name: "Grace Tolentino", course: "STEM",  status: "noshow",  time: "8:51 AM", duration: "—"     },
  { ticket: "A-046", name: "Sam Ocampo",      course: "BSBA",  status: "served",  time: "8:59 AM", duration: "6 min" },
  { ticket: "W-001", name: "Dina Flores",     course: "BSHM",  status: "served",  time: "9:04 AM", duration: "5 min", walkin: true },
  { ticket: "A-043", name: "Nico Herrera",    course: "ABM",   status: "removed", time: "8:38 AM", duration: "—"     },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let walkInCounter = 3;
function makeWalkIn(name, course) {
  return {
    ticket: `W-${String(walkInCounter++).padStart(3, "0")}`,
    name: name || "Walk-in Student",
    course: course || "Unspecified",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    type: "walkin",
    eta: 99,
  };
}

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
  input:focus,select:focus { box-shadow:0 0 0 2px rgba(59,130,246,0.4); }
  .grace-ring { transform-origin:center; transform:rotate(-90deg); transition:stroke-dashoffset 1s linear; }
  .queue-row { transition:background 0.15s ease; }
  .queue-row:hover { background:rgba(255,255,255,0.03) !important; }
  .queue-row:hover .rm-btn { opacity:1 !important; }
  .rm-btn { opacity:0; transition:opacity 0.15s ease; }
  .lq-row { transition:background 0.15s ease; }
  .lq-row:hover { background:rgba(59,130,246,0.05) !important; }
  .lq-row:hover .lq-rm { opacity:1 !important; }
  .lq-rm { opacity:0; transition:opacity 0.15s ease; }
  .filter-sel { appearance:none; cursor:pointer; }
  .toggle-track { transition:background 0.25s ease; cursor:pointer; }
  .toggle-thumb { transition:transform 0.25s cubic-bezier(.22,.68,0,1.4), background 0.2s ease; }
  .settings-row { transition:background 0.15s ease; border-radius:12px; }
  .settings-row:hover { background:rgba(255,255,255,0.03); }
  .save-toast { animation:toastIn 0.35s cubic-bezier(.22,.68,0,1.2) forwards; }
  @keyframes toastIn { from{opacity:0;transform:translateY(8px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);} }
`;

// ─── SMALL ATOMS ─────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const isWalk = type === "walkin";
  return (
    <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "3px 9px", background: isWalk ? "rgba(251,191,36,0.12)" : "rgba(59,130,246,0.12)", color: isWalk ? "#fbbf24" : "#60a5fa", border: `1px solid ${isWalk ? "rgba(251,191,36,0.25)" : "rgba(59,130,246,0.25)"}`, whiteSpace: "nowrap" }}>
      {isWalk ? "Walk-in" : "Booked"}
    </span>
  );
}

function LevelBadge({ course }) {
  const isSHS = SHS_PROGRAMS.includes(course);
  return (
    <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "3px 9px", background: isSHS ? "rgba(251,191,36,0.1)" : "rgba(129,140,248,0.12)", color: isSHS ? "#fbbf24" : "#818cf8", border: `1px solid ${isSHS ? "rgba(251,191,36,0.2)" : "rgba(129,140,248,0.25)"}`, whiteSpace: "nowrap" }}>
      {isSHS ? "Senior High" : "College"}
    </span>
  );
}

const H_CFG = {
  served:  { color: "#4ade80", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.2)",    icon: CheckCircle2,  label: "Served"  },
  noshow:  { color: "#f87171", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.2)",    icon: AlertOctagon,  label: "No-Show" },
  removed: { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.15)", icon: MinusCircle,   label: "Removed" },
};

// ╔═══════════════════════════════════════════════════════════╗
// ║  MAIN COMPONENT                                          ║
// ╚═══════════════════════════════════════════════════════════╝
export default function AdminDashboard() {
  const [activeNav, setActiveNav]           = useState("dashboard");
  const [queue, setQueue]                   = useState([]);
  const [serving, setServing]               = useState(INITIAL_SERVING);
  const [history, setHistory]               = useState(HISTORY_LOG);
  const [paused, setPaused]                 = useState(false);
  const [graceActive, setGraceActive]       = useState(false);
  const [graceTime, setGraceTime]           = useState(15);
  const [noShowWarning, setNoShowWarning]   = useState(false);
  const [totalServed, setTotalServed]       = useState(4);
  const [noShows, setNoShows]               = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [walkInModal, setWalkInModal]       = useState(false);
  const [walkInName, setWalkInName]         = useState("");
  const [walkInCourse, setWalkInCourse]     = useState("");
  const [flash, setFlash]                   = useState(false);
  const [recallPing, setRecallPing]         = useState(false);
  const [removeId, setRemoveId]             = useState(null);
  // Live Queue filters
  const [lqSearch, setLqSearch]   = useState("");
  const [lqProgram, setLqProgram] = useState("all");
  const [lqType, setLqType]       = useState("all");
  const [lqSort, setLqSort]       = useState("position");
  // History filters
  const [hSearch, setHSearch]     = useState("");
  const [hStatus, setHStatus]     = useState("all");
  const [hLevel, setHLevel]       = useState("all");
  const [hSortCol, setHSortCol]   = useState("time");
  const [hSortDir, setHSortDir]   = useState("desc");
  // Settings state
  const [sGrace, setSGrace]               = useState(15);
  const [sWindow, setSWindow]             = useState("3");
  const [sPrinter, setSPrinter]           = useState(false);
  const [sMaxQueue, setSMaxQueue]         = useState(50);
  const [sAutoAdvance, setSAutoAdvance]   = useState(false);
  const [sPwModal, setSPwModal]           = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const timerRef = useRef(null);
  const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ── Grace countdown ───────────────────────────────────────
  useEffect(() => {
    if (graceActive && !paused) {
      timerRef.current = setInterval(() => {
        setGraceTime(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setNoShowWarning(true);
            setGraceActive(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [graceActive, paused]);

  // ── Helper: map a Supabase row → queue item shape ─────────
  const rowToQueueItem = (row, index) => ({
    ticket:  row.ticket_number,
    name:    row.student_name,
    course:  row.course,
    time:    row.appointment_time,
    type:    row.booking_type === "walkin" ? "walkin" : "booked",
    eta:     (index + 1) * 2,
    id:      row.id,          // keep the Supabase PK for future updates
  });

  // ── Fetch initial waiting tickets from Supabase ────────────
  useEffect(() => {
    const fetchQueue = async () => {
      const { data, error } = await supabase
        .from("queue_tickets")
        .select("*")
        .eq("status", "waiting")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching queue:", error.message);
        return;
      }

      setQueue((data || []).map(rowToQueueItem));
    };

    fetchQueue();
  }, []);

  // ── Realtime subscription: listen for new INSERTs ─────────
  useEffect(() => {
    const channel = supabase
      .channel("queue_tickets_inserts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "queue_tickets" },
        (payload) => {
          const newRow = payload.new;
          // Only add to the live queue if the inserted ticket is 'waiting'
          if (newRow.status !== "waiting") return;
          setQueue(prev => {
            const item = rowToQueueItem(newRow, prev.length);
            return [...prev, item];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Core queue actions (all use sGrace, no GRACE_SECONDS) ─
  const startGrace = () => {
    setGraceTime(sGrace);
    setGraceActive(true);
    setNoShowWarning(false);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  };

  const callNext = async () => {
    if (paused || queue.length === 0) return;

    // 1. Mark the current serving student as 'served' in Supabase
    if (serving) {
      setHistory(h => [{ ...serving, status: "served", time: nowStr, duration: "5 min" }, ...h].slice(0, 30));
      setTotalServed(n => n + 1);
      const { error: servedError } = await supabase
        .from("queue_tickets")
        .update({ status: "served" })
        .eq("ticket_number", serving.ticket);
      if (servedError) console.error("Error marking served:", servedError.message);
    }

    // 2. Promote the next student to 'serving' in Supabase and local state
    const [next, ...rest] = queue;
    const { error: servingError } = await supabase
      .from("queue_tickets")
      .update({ status: "serving" })
      .eq("ticket_number", next.ticket);
    if (servingError) console.error("Error marking serving:", servingError.message);

    setServing({ ...next, calledAt: nowStr });
    setQueue(rest);
    setNoShowWarning(false);
    setGraceActive(false);
    startGrace();
  };

  const recall = () => {
    setRecallPing(true);
    setTimeout(() => setRecallPing(false), 1200);
    setGraceTime(sGrace);
    setGraceActive(true);
    setNoShowWarning(false);
  };

  const markNoShow = async () => {
    if (!serving) return;

    // Update Supabase first
    const { error } = await supabase
      .from("queue_tickets")
      .update({ status: "noshow" })
      .eq("ticket_number", serving.ticket);
    if (error) console.error("Error marking no-show:", error.message);

    // Update local state
    setHistory(h => [{ ...serving, status: "noshow", time: nowStr, duration: "—" }, ...h].slice(0, 30));
    setNoShows(n => n + 1);
    setNoShowWarning(false);
    setGraceActive(false);

    if (sAutoAdvance && queue.length > 0) {
      const [next, ...rest] = queue;
      setServing({ ...next, calledAt: nowStr });
      setQueue(rest);
      startGrace();
    } else {
      setServing(null);
    }
  };

  const removeFromQueue = async (ticket) => {
    const student = queue.find(s => s.ticket === ticket);

    // Update Supabase
    const { error } = await supabase
      .from("queue_tickets")
      .update({ status: "removed" })
      .eq("ticket_number", ticket);
    if (error) console.error("Error removing from queue:", error.message);

    // Animate removal then update local state
    setRemoveId(ticket);
    setTimeout(() => {
      setQueue(q => q.filter(s => s.ticket !== ticket));
      if (student) setHistory(h => [{ ...student, status: "removed", time: nowStr, duration: "—" }, ...h].slice(0, 30));
      setRemoveId(null);
    }, 350);
  };

  const addWalkIn = () => {
    if (!walkInName) return;
    setQueue(q => [...q, makeWalkIn(walkInName, walkInCourse)]);
    setWalkInName(""); setWalkInCourse(""); setWalkInModal(false);
  };

  const saveSettings = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2400);
  };

  // ── Derived values ────────────────────────────────────────
  const avgWait      = queue.length > 0 ? Math.round(queue.length * 2.5) : 0;
  const circumference = 2 * Math.PI * 38;
  const dashOffset    = circumference * (1 - graceTime / sGrace);   // ← uses sGrace

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard"      },
    { id: "queue",     icon: Users,           label: "Live Queue"     },
    { id: "history",   icon: History,         label: "History & Logs" },
    { id: "settings",  icon: Settings,        label: "Settings"       },
  ];

  // ── Grace Timer sub-component (uses sGrace for progress bar) ─
  const GraceTimer = () => (
    <div style={{ background: noShowWarning ? "rgba(239,68,68,0.12)" : graceActive ? "rgba(37,99,235,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${noShowWarning ? "rgba(239,68,68,0.35)" : graceActive ? "rgba(37,99,235,0.25)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 16, transition: "all 0.4s ease" }}>
      <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle
            className="grace-ring"
            cx="40" cy="40" r="38" fill="none"
            stroke={noShowWarning ? "#ef4444" : graceTime <= 5 ? "#f59e0b" : "#3b82f6"}
            strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {noShowWarning
            ? <AlertTriangle size={22} color="#ef4444" className="noshow-pulse" />
            : <>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, color: graceTime <= 5 ? "#fbbf24" : "white", lineHeight: 1 }}>{graceTime}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.04em" }}>SEC</div>
              </>
          }
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {noShowWarning ? (
          <div className="noshow-pulse">
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", marginBottom: 4 }}>⚠ Grace Period Expired</div>
            <div style={{ fontSize: 11, color: "rgba(248,113,113,0.7)", lineHeight: 1.5, marginBottom: 10 }}>Student did not appear. Mark as No-Show or Recall.</div>
            <button onClick={markNoShow} className="ctrl-btn" style={{ background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "7px 14px", color: "#fca5a5", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldAlert size={13} /> Mark as No-Show
            </button>
          </div>
        ) : graceActive ? (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>Grace Period Active</div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ height: "100%", width: `${(graceTime / sGrace) * 100}%`, background: graceTime <= 5 ? "#f59e0b" : "#3b82f6", borderRadius: 99, transition: "width 1s linear, background 0.3s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Student has {graceTime}s to reach the window</div>
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

  const HistoryItem = ({ h }) => {
    const cfg = H_CFG[h.status] || {};
    const Icon = cfg.icon;
    return (
      <div style={{ padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={13} color={cfg.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</span>
            {h.walkin && <span style={{ fontSize: 9, fontWeight: 700, color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 4, padding: "1px 5px", flexShrink: 0 }}>Walk-in</span>}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ fontFamily: "'Space Mono',monospace" }}>{h.ticket}</span><span>·</span><span>{h.time}</span>
            {h.duration !== "—" && <><span>·</span><span>{h.duration}</span></>}
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 99, padding: "2px 8px", flexShrink: 0 }}>{cfg.label}</span>
      </div>
    );
  };

  // ╔═══════════════════════════════════════════════════════════╗
  // ║  renderDashboard                                         ║
  // ╚═══════════════════════════════════════════════════════════╝
  const renderDashboard = () => (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "In Queue",       value: queue.length,  icon: Users,        color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.2)"  },
          { label: "Avg. Wait Time", value: `${avgWait}m`, icon: Clock,        color: "#a78bfa", bg: "rgba(167,139,250,0.1)",  border: "rgba(167,139,250,0.2)" },
          { label: "Served Today",   value: totalServed,   icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.2)"   },
          { label: "No-Shows",       value: noShows,       icon: ZapOff,       color: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.2)" },
        ].map((s, i) => (
          <div key={i} className="stat-card fade-in" style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: "18px 20px", animationDelay: `${i * 0.06}s` }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={17} color={s.color} />
              </div>
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 28, fontWeight: 700, color: "white", letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 6, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Now Serving + Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Terminal */}
        <div className={`fade-in ${flash ? "flash-enter" : ""}`} style={{ background: "linear-gradient(145deg,#0f2057 0%,#0d1a40 60%,#0a1630 100%)", border: noShowWarning ? "1.5px solid rgba(248,113,113,0.5)" : "1.5px solid rgba(37,99,235,0.35)", borderRadius: 20, padding: "24px", position: "relative", overflow: "hidden", animationDelay: "0.1s", boxShadow: noShowWarning ? "0 0 40px rgba(239,68,68,0.15)" : "0 0 40px rgba(37,99,235,0.1)" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: noShowWarning ? "rgba(239,68,68,0.07)" : "rgba(37,99,235,0.08)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Monitor size={14} color="#60a5fa" />
              <span style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.08em" }}>WINDOW {sWindow} · NOW SERVING</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: paused ? "#fbbf24" : "#4ade80", fontWeight: 600 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: paused ? "#f59e0b" : "#22c55e" }} />
              {paused ? "PAUSED" : "ACTIVE"}
            </div>
          </div>
          {serving ? (
            <>
              <div className={recallPing ? "ping-ring" : ""} style={{ display: "inline-block", marginBottom: 16, background: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.4)", borderRadius: 14, padding: "8px 18px" }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 38, fontWeight: 700, color: "white", letterSpacing: "0.02em", lineHeight: 1 }}>{serving.ticket}</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{serving.name}</div>
                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <LevelBadge course={serving.course} />
                  <TypeBadge type={serving.type} />
                  {serving.calledAt && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}><Zap size={10} /> Called: {serving.calledAt}</span>}
                </div>
              </div>
              <div style={{ marginTop: 18 }}><GraceTimer /></div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <Monitor size={40} color="rgba(255,255,255,0.1)" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>No student at the window</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>Press "Call Next" to begin</div>
            </div>
          )}
        </div>

        {/* Controls + Up Next */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="fade-in" style={{ background: "rgba(15,25,54,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "20px", animationDelay: "0.15s" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>QUEUE CONTROLS</div>
            <button className="ctrl-btn" onClick={callNext} disabled={paused || queue.length === 0} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: paused || queue.length === 0 ? "rgba(37,99,235,0.2)" : "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "white", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "'Outfit',sans-serif", marginBottom: 10, boxShadow: paused || queue.length === 0 ? "none" : "0 8px 28px rgba(37,99,235,0.45)" }}>
              <SkipForward size={20} /> Call Next
              {queue.length > 0 && !paused && <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{queue[0]?.ticket}</div>}
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <button className="ctrl-btn" onClick={recall} disabled={!serving || paused} style={{ padding: "12px 10px", borderRadius: 12, border: "1px solid rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.1)", color: "#fbbf24", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Outfit',sans-serif" }}>
                <RotateCcw size={14} /> Recall
              </button>
              <button className="ctrl-btn" onClick={() => setPaused(p => !p)} style={{ padding: "12px 10px", borderRadius: 12, border: paused ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.1)", background: paused ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)", color: paused ? "#4ade80" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Outfit',sans-serif" }}>
                {paused ? <><PlayCircle size={14} /> Resume</> : <><PauseCircle size={14} /> Pause</>}
              </button>
            </div>
            <button className="ctrl-btn" onClick={() => setWalkInModal(true)} style={{ width: "100%", padding: "11px", borderRadius: 12, border: "1px solid rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.08)", color: "#c4b5fd", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Outfit',sans-serif" }}>
              <UserPlus size={14} /> Add Walk-in Student
            </button>
            {paused && <div className="fade-in" style={{ marginTop: 12, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#fbbf24" }}><PauseCircle size={13} /> Queue is paused. Press Resume to continue.</div>}
          </div>
          <div className="fade-in" style={{ background: "rgba(15,25,54,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "18px", flex: 1, animationDelay: "0.2s" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 14 }}>UP NEXT</div>
            {queue.slice(0, 3).map((s, i) => (
              <div key={s.ticket} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none", opacity: 1 - i * 0.2 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#93c5fd", flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono',monospace" }}>{s.ticket} · {s.time}</div>
                </div>
                <TypeBadge type={s.type} />
              </div>
            ))}
            {queue.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Queue is empty</div>}
          </div>
        </div>
      </div>

      {/* Queue mini + History mini */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
        <div className="fade-in" style={{ background: "rgba(15,25,54,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", animationDelay: "0.25s" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={14} color="#60a5fa" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Live Queue</span>
            <div style={{ background: "rgba(37,99,235,0.25)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 99, padding: "2px 9px", fontSize: 11, color: "#93c5fd", fontWeight: 700 }}>{queue.length}</div>
            <button onClick={() => setActiveNav("queue")} style={{ marginLeft: "auto", fontSize: 11, color: "#60a5fa", background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>View all →</button>
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {queue.length === 0
              ? <div style={{ textAlign: "center", padding: "32px", fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Queue is empty</div>
              : queue.slice(0, 6).map((s, i) => (
                <div key={s.ticket} className={`queue-row ${removeId === s.ticket ? "row-remove" : ""}`} style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 80px 32px", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", gap: 8 }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: 700 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono',monospace" }}>{s.ticket}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.course}</div>
                  <TypeBadge type={s.type} />
                  <button className="rm-btn ctrl-btn" onClick={() => removeFromQueue(s.ticket)} style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <X size={12} color="#f87171" />
                  </button>
                </div>
              ))
            }
          </div>
        </div>
        <div className="fade-in" style={{ background: "rgba(15,25,54,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", animationDelay: "0.3s" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
            <History size={14} color="#a78bfa" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Recent Log</span>
            <button onClick={() => setActiveNav("history")} style={{ marginLeft: "auto", fontSize: 11, color: "#a78bfa", background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>View all →</button>
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {history.map((h, i) => <HistoryItem key={i} h={h} />)}
          </div>
        </div>
      </div>
    </div>
  );

  // ╔═══════════════════════════════════════════════════════════╗
  // ║  renderLiveQueue                                         ║
  // ╚═══════════════════════════════════════════════════════════╝
  const renderLiveQueue = () => {
    const filtered = queue
      .filter(s => {
        const q  = lqSearch.toLowerCase();
        const ms = s.name.toLowerCase().includes(q) || s.ticket.toLowerCase().includes(q) || s.course.toLowerCase().includes(q);
        const mp = lqProgram === "all" || s.course === lqProgram;
        const mt = lqType    === "all" || s.type   === lqType;
        return ms && mp && mt;
      })
      .sort((a, b) => {
        if (lqSort === "name") return a.name.localeCompare(b.name);
        if (lqSort === "time") return a.time.localeCompare(b.time);
        return a.eta - b.eta;
      });

    const shsCnt  = queue.filter(s => SHS_PROGRAMS.includes(s.course)).length;
    const colCnt  = queue.filter(s => TERTIARY_PROGRAMS.includes(s.course)).length;
    const walkCnt = queue.filter(s => s.type === "walkin").length;
    const clearFilters = () => { setLqSearch(""); setLqProgram("all"); setLqType("all"); };
    const filtersActive = lqSearch || lqProgram !== "all" || lqType !== "all";

    return (
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }} className="fade-in">
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Total in Queue", value: queue.length, color: "#60a5fa", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.2)"  },
            { label: "Senior High",    value: shsCnt,       color: "#fbbf24", bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.2)"  },
            { label: "College",        value: colCnt,       color: "#818cf8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.2)" },
            { label: "Walk-ins",       value: walkCnt,      color: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.2)" },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: p.bg, border: `1px solid ${p.border}`, borderRadius: 12, padding: "10px 18px" }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 22, fontWeight: 700, color: "white" }}>{p.value}</span>
              <span style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>{p.label}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(15,25,54,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 200px" }}>
              <Search size={13} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input value={lqSearch} onChange={e => setLqSearch(e.target.value)} placeholder="Search name, ticket, or program…" style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: 13, fontFamily: "'Outfit',sans-serif" }} />
            </div>
            <div style={{ position: "relative" }}>
              <SlidersHorizontal size={12} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <select className="filter-sel" value={lqProgram} onChange={e => setLqProgram(e.target.value)} style={{ padding: "9px 30px 9px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,25,60,0.95)", color: lqProgram !== "all" ? "white" : "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'Outfit',sans-serif", minWidth: 190 }}>
                <option value="all">All Programs</option>
                <optgroup label="── Senior High School">{SHS_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}</optgroup>
                <optgroup label="── Tertiary / College">{TERTIARY_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}</optgroup>
              </select>
              <ChevronDownIcon size={12} color="rgba(255,255,255,0.3)" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            <div style={{ position: "relative" }}>
              <Filter size={12} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <select className="filter-sel" value={lqType} onChange={e => setLqType(e.target.value)} style={{ padding: "9px 30px 9px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,25,60,0.95)", color: lqType !== "all" ? "white" : "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'Outfit',sans-serif", minWidth: 130 }}>
                <option value="all">All Types</option>
                <option value="booked">Booked</option>
                <option value="walkin">Walk-in</option>
              </select>
              <ChevronDownIcon size={12} color="rgba(255,255,255,0.3)" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            <div style={{ position: "relative" }}>
              <ArrowUpDown size={12} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <select className="filter-sel" value={lqSort} onChange={e => setLqSort(e.target.value)} style={{ padding: "9px 30px 9px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,25,60,0.95)", color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "'Outfit',sans-serif", minWidth: 150 }}>
                <option value="position">Sort: Position</option>
                <option value="name">Sort: Name A–Z</option>
                <option value="time">Sort: Time Slot</option>
              </select>
              <ChevronDownIcon size={12} color="rgba(255,255,255,0.3)" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            {filtersActive && (
              <button onClick={clearFilters} style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                <X size={11} /> Clear
              </button>
            )}
          </div>

          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "44px 64px 1fr 160px 96px 100px 90px 80px 44px", padding: "9px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", gap: 8, alignItems: "center" }}>
            {["#","Ticket","Name","Program","Time Slot","Level","Type","Course",""].map((h, i) => (
              <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.06em" }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ maxHeight: 460, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "52px 20px" }}>
                <Search size={32} color="rgba(255,255,255,0.07)" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>No students match your filters</div>
                <button onClick={clearFilters} style={{ marginTop: 10, background: "none", border: "none", color: "#60a5fa", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Clear all filters</button>
              </div>
            ) : filtered.map(s => {
              const pos = queue.findIndex(q => q.ticket === s.ticket) + 1;
              return (
                <div key={s.ticket} className={`lq-row ${removeId === s.ticket ? "row-remove" : ""}`} style={{ display: "grid", gridTemplateColumns: "44px 64px 1fr 160px 96px 100px 90px 80px 44px", padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", gap: 8 }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: pos === 1 ? "#60a5fa" : "rgba(255,255,255,0.22)", fontWeight: 700 }}>{pos === 1 ? "→1" : pos}</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>{s.ticket}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={s.course}>{s.course}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.4)" }}><Clock size={10} />{s.time}</div>
                  <LevelBadge course={s.course} />
                  <TypeBadge type={s.type} />
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{SHS_PROGRAMS.includes(s.course) ? "SHS" : "Tertiary"}</div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="lq-rm ctrl-btn" onClick={() => removeFromQueue(s.ticket)} style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <X size={13} color="#f87171" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: "11px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              Showing <strong style={{ color: "rgba(255,255,255,0.6)" }}>{filtered.length}</strong> of <strong style={{ color: "rgba(255,255,255,0.6)" }}>{queue.length}</strong> students in queue
            </span>
            <button className="ctrl-btn" onClick={() => setWalkInModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", color: "#c4b5fd", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
              <UserPlus size={13} /> Add Walk-in
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ╔═══════════════════════════════════════════════════════════╗
  // ║  renderHistory                                           ║
  // ╚═══════════════════════════════════════════════════════════╝
  const renderHistory = () => {
    const servedEntries  = history.filter(h => h.status === "served");
    const noshowEntries  = history.filter(h => h.status === "noshow");
    const removedEntries = history.filter(h => h.status === "removed");
    const totalEntries   = history.length;

    const completionRate = totalEntries > 0 ? Math.round((servedEntries.length / totalEntries) * 100) : 0;
    const avgResolution  = (() => {
      const durations = servedEntries.map(h => parseInt(h.duration)).filter(n => !isNaN(n));
      if (!durations.length) return "—";
      return `${Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)} min`;
    })();

    const toggleSort = (col) => {
      if (hSortCol === col) setHSortDir(d => d === "asc" ? "desc" : "asc");
      else { setHSortCol(col); setHSortDir("asc"); }
    };

    const filtered = [...history]
      .filter(h => {
        const q  = hSearch.toLowerCase();
        const ms = h.name.toLowerCase().includes(q) || h.ticket.toLowerCase().includes(q) || h.course.toLowerCase().includes(q);
        const mv = hStatus === "all" || h.status === hStatus;
        const ml = hLevel  === "all"
          || (hLevel === "shs"      && SHS_PROGRAMS.includes(h.course))
          || (hLevel === "tertiary" && TERTIARY_PROGRAMS.includes(h.course));
        return ms && mv && ml;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (hSortCol === "name")   cmp = a.name.localeCompare(b.name);
        if (hSortCol === "ticket") cmp = a.ticket.localeCompare(b.ticket);
        if (hSortCol === "status") cmp = a.status.localeCompare(b.status);
        if (hSortCol === "time")   cmp = a.time.localeCompare(b.time);
        return hSortDir === "asc" ? cmp : -cmp;
      });

    const filtersActive = hSearch || hStatus !== "all" || hLevel !== "all";

    const STATUS_CFG = {
      served:  { label: "Served",  color: "#4ade80", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.25)",   icon: CheckCircle2 },
      noshow:  { label: "No-Show", color: "#f87171", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",   icon: AlertOctagon },
      removed: { label: "Removed", color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)",  icon: MinusCircle  },
    };

    const MiniBar = ({ value, max, color }) => (
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
    );

    const SortTh = ({ col, children }) => {
      const active = hSortCol === col;
      return (
        <div onClick={() => toggleSort(col)} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", userSelect: "none", fontSize: 10, color: active ? "#93c5fd" : "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.06em" }}>
          {children}
          <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <ChevronUp   size={8} color={active && hSortDir === "asc"  ? "#60a5fa" : "rgba(255,255,255,0.2)"} />
            <ChevronDownIcon size={8} color={active && hSortDir === "desc" ? "#60a5fa" : "rgba(255,255,255,0.2)"} />
          </span>
        </div>
      );
    };

    return (
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }} className="fade-in">

        {/* Analytics cards — 3 columns */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 16, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Percent size={16} color="#4ade80" /></div>
              <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600 }}>Completion Rate</span>
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 30, fontWeight: 700, color: "white", lineHeight: 1, marginBottom: 10 }}>{completionRate}%</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MiniBar value={completionRate} max={100} color="#4ade80" />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{servedEntries.length}/{totalEntries} served</span>
            </div>
          </div>
          <div style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 16, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><TimerReset size={16} color="#60a5fa" /></div>
              <span style={{ fontSize: 11, color: "#60a5fa", fontWeight: 600 }}>Avg. Resolution</span>
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 30, fontWeight: 700, color: "white", lineHeight: 1, marginBottom: 10 }}>{avgResolution}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Per served student today</div>
          </div>
          <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 16, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><AlertOctagon size={16} color="#f87171" /></div>
              <span style={{ fontSize: 11, color: "#f87171", fontWeight: 600 }}>No-Show Rate</span>
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 30, fontWeight: 700, color: "white", lineHeight: 1, marginBottom: 10 }}>
              {totalEntries > 0 ? Math.round((noshowEntries.length / totalEntries) * 100) : 0}%
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MiniBar value={noshowEntries.length} max={Math.max(totalEntries, 1)} color="#f87171" />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{noshowEntries.length} today</span>
            </div>
          </div>
        </div>

        {/* Breakdown bar */}
        <div style={{ background: "rgba(15,25,54,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px 22px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart2 size={14} color="#a78bfa" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>Today's Breakdown</span>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{totalEntries} total processed</span>
          </div>
          <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", gap: 2, marginBottom: 14 }}>
            {totalEntries > 0
              ? [{ count: servedEntries.length, color: "#22c55e" }, { count: noshowEntries.length, color: "#ef4444" }, { count: removedEntries.length, color: "#64748b" }].filter(s => s.count > 0).map((seg, i) => (
                  <div key={i} style={{ flex: seg.count, background: seg.color, borderRadius: 99 }} />
                ))
              : <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 99 }} />
            }
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { label: "Served",  count: servedEntries.length,  color: "#4ade80" },
              { label: "No-Show", count: noshowEntries.length,  color: "#f87171" },
              { label: "Removed", count: removedEntries.length, color: "#64748b" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{l.label}</span>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>{l.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* History table */}
        <div style={{ background: "rgba(15,25,54,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 4 }}>
              <History size={14} color="#a78bfa" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Session Log</span>
              <div style={{ background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 99, padding: "2px 9px", fontSize: 11, color: "#c4b5fd", fontWeight: 700 }}>{history.length}</div>
            </div>
            <div style={{ position: "relative", flex: "1 1 180px" }}>
              <Search size={13} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input value={hSearch} onChange={e => setHSearch(e.target.value)} placeholder="Search name, ticket, program…" style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: 13, fontFamily: "'Outfit',sans-serif" }} />
            </div>
            <div style={{ position: "relative" }}>
              <Filter size={12} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <select className="filter-sel" value={hStatus} onChange={e => setHStatus(e.target.value)} style={{ padding: "9px 28px 9px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,25,60,0.95)", color: hStatus !== "all" ? "white" : "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'Outfit',sans-serif", minWidth: 138 }}>
                <option value="all">All Statuses</option>
                <option value="served">Served</option>
                <option value="noshow">No-Show</option>
                <option value="removed">Removed</option>
              </select>
              <ChevronDownIcon size={12} color="rgba(255,255,255,0.3)" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            <div style={{ position: "relative" }}>
              <SlidersHorizontal size={12} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <select className="filter-sel" value={hLevel} onChange={e => setHLevel(e.target.value)} style={{ padding: "9px 28px 9px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,25,60,0.95)", color: hLevel !== "all" ? "white" : "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'Outfit',sans-serif", minWidth: 138 }}>
                <option value="all">All Levels</option>
                <option value="shs">Senior High</option>
                <option value="tertiary">College</option>
              </select>
              <ChevronDownIcon size={12} color="rgba(255,255,255,0.3)" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            {filtersActive && (
              <button onClick={() => { setHSearch(""); setHStatus("all"); setHLevel("all"); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                <X size={11} /> Clear
              </button>
            )}
          </div>

          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "40px 72px 1fr 140px 120px 100px 90px", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.06em" }}>#</div>
            <SortTh col="ticket">TICKET</SortTh>
            <SortTh col="name">STUDENT</SortTh>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.06em" }}>PROGRAM</div>
            <SortTh col="status">STATUS</SortTh>
            <SortTh col="time">TIME</SortTh>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.06em" }}>DURATION</div>
          </div>

          {/* Rows */}
          <div style={{ maxHeight: 440, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "52px 20px" }}>
                <Search size={32} color="rgba(255,255,255,0.07)" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>No records match your filters</div>
                <button onClick={() => { setHSearch(""); setHStatus("all"); setHLevel("all"); }} style={{ marginTop: 10, background: "none", border: "none", color: "#a78bfa", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Clear all filters</button>
              </div>
            ) : filtered.map((h, i) => {
              const cfg  = STATUS_CFG[h.status] || {};
              const Icon = cfg.icon;
              const isSHS = SHS_PROGRAMS.includes(h.course);
              return (
                <div key={i} className="lq-row" style={{ display: "grid", gridTemplateColumns: "40px 72px 1fr 140px 120px 100px 90px", padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", gap: 12 }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 700 }}>{i + 1}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>{h.ticket}</span>
                    {h.walkin && <span style={{ fontSize: 8, fontWeight: 700, color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 4, padding: "1px 4px" }}>W</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{h.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{h.walkin ? "Walk-in" : "Booked"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }} title={h.course}>{h.course}</div>
                    <span style={{ fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "2px 6px", background: isSHS ? "rgba(251,191,36,0.1)" : "rgba(129,140,248,0.12)", color: isSHS ? "#fbbf24" : "#818cf8", border: `1px solid ${isSHS ? "rgba(251,191,36,0.2)" : "rgba(129,140,248,0.25)"}` }}>{isSHS ? "Senior High" : "College"}</span>
                  </div>
                  <div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "4px 11px", background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {Icon && <Icon size={11} />}{cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'Space Mono',monospace" }}>{h.time}</div>
                  <div style={{ fontSize: 12, color: h.duration === "—" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>{h.duration}</div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: "11px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              Showing <strong style={{ color: "rgba(255,255,255,0.6)" }}>{filtered.length}</strong> of <strong style={{ color: "rgba(255,255,255,0.6)" }}>{history.length}</strong> log entries
            </span>
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { label: "Served",  count: filtered.filter(h => h.status === "served").length,  color: "#4ade80" },
                { label: "No-Show", count: filtered.filter(h => h.status === "noshow").length,  color: "#f87171" },
                { label: "Removed", count: filtered.filter(h => h.status === "removed").length, color: "#64748b" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: l.color }} />
                  {l.label}: <strong style={{ color: "rgba(255,255,255,0.6)", marginLeft: 2 }}>{l.count}</strong>
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
    const SectionCard = ({ icon: Icon, iconColor, iconBg, iconBorder, title, subtitle, children }) => (
      <div style={{ background: "rgba(15,25,54,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "18px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: iconBg, border: `1px solid ${iconBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={17} color={iconColor} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.01em" }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{subtitle}</div>}
          </div>
        </div>
        <div style={{ padding: "6px 0 8px" }}>{children}</div>
      </div>
    );

    const SettingRow = ({ label, hint, children, noBorder }) => (
      <div className="settings-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: noBorder ? "none" : "1px solid rgba(255,255,255,0.04)", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>{label}</div>
          {hint && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3, lineHeight: 1.5 }}>{hint}</div>}
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
      </div>
    );

    const Toggle = ({ value, onChange }) => (
      <div className="toggle-track" onClick={() => onChange(!value)} style={{ width: 46, height: 26, borderRadius: 99, background: value ? "rgba(37,99,235,0.8)" : "rgba(255,255,255,0.1)", border: `1px solid ${value ? "rgba(59,130,246,0.6)" : "rgba(255,255,255,0.12)"}`, position: "relative", boxShadow: value ? "0 0 12px rgba(37,99,235,0.35)" : "none" }}>
        <div className="toggle-thumb" style={{ position: "absolute", top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: value ? "white" : "rgba(255,255,255,0.4)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
      </div>
    );

    const NumInput = ({ value, onChange, min, max, unit }) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, overflow: "hidden" }}>
          <button onClick={() => onChange(Math.max(min, value - 1))} style={{ width: 32, height: 38, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid rgba(255,255,255,0.08)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}>−</button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px" }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 700, color: "white", minWidth: 28, textAlign: "center" }}>{value}</span>
            {unit && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{unit}</span>}
          </div>
          <button onClick={() => onChange(Math.min(max, value + 1))} style={{ width: 32, height: 38, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}>+</button>
        </div>
      </div>
    );

    const StyledSelect = ({ value, onChange, options }) => (
      <div style={{ position: "relative" }}>
        <select value={value} onChange={e => onChange(e.target.value)} className="filter-sel" style={{ padding: "9px 36px 9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: 13, fontFamily: "'Outfit',sans-serif", minWidth: 160 }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDownIcon size={13} color="rgba(255,255,255,0.4)" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>
    );

    return (
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 40px" }} className="fade-in">
        <div style={{ maxWidth: 740, margin: "0 auto" }}>

          {/* Queue Configuration */}
          <SectionCard icon={Sliders} iconColor="#60a5fa" iconBg="rgba(59,130,246,0.12)" iconBorder="rgba(59,130,246,0.25)" title="Queue Configuration" subtitle="Control how the live queue behaves during enrollment sessions">
            <SettingRow label="Grace Period Duration" hint="Time a student has to reach the window after being called before being flagged as absent.">
              <NumInput value={sGrace} onChange={v => { setSGrace(v); setGraceTime(v); }} min={5} max={60} unit="sec" />
            </SettingRow>
            <SettingRow label="Active Terminal / Window" hint="The service window this admin panel is controlling right now.">
              <StyledSelect value={sWindow} onChange={setSWindow} options={[
                { value: "1", label: "Window 1 — Freshmen" },
                { value: "2", label: "Window 2 — Transferees" },
                { value: "3", label: "Window 3 — Registrar" },
                { value: "4", label: "Window 4 — Accounting" },
              ]} />
            </SettingRow>
            <SettingRow label="Maximum Queue Capacity" hint="Students will be prevented from booking once this limit is reached.">
              <NumInput value={sMaxQueue} onChange={setSMaxQueue} min={10} max={200} unit="students" />
            </SettingRow>
            <SettingRow label="Auto-Advance After No-Show" hint="Automatically call the next student once a no-show is confirmed, without manual intervention." noBorder>
              <Toggle value={sAutoAdvance} onChange={setSAutoAdvance} />
            </SettingRow>
          </SectionCard>

          {/* Hardware Integration */}
          <SectionCard icon={Cpu} iconColor="#a78bfa" iconBg="rgba(167,139,250,0.1)" iconBorder="rgba(167,139,250,0.25)" title="Hardware Integration" subtitle="Connect physical devices to extend the queueing system's reach">
            <SettingRow label="Physical Paper Ticket Printer" hint={<span>Prints a paper ticket stub when a walk-in student is added to the queue.{!sPrinter && <span style={{ color: "rgba(255,255,255,0.3)", marginLeft: 6 }}>● Inactive</span>}{sPrinter && <span style={{ color: "#4ade80", marginLeft: 6 }}>● Active</span>}</span>} noBorder>
              <Toggle value={sPrinter} onChange={setSPrinter} />
            </SettingRow>
          </SectionCard>

          {/* Account Details */}
          <SectionCard icon={User} iconColor="#fbbf24" iconBg="rgba(251,191,36,0.1)" iconBorder="rgba(251,191,36,0.2)" title="Account Details" subtitle="Your administrator profile and security settings">
            <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.02em", boxShadow: "0 4px 16px rgba(37,99,235,0.35)", flexShrink: 0 }}>RC</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>Rosa Cruz</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Registrar · STI Calamba</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 6, padding: "3px 9px" }}>Administrator</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 6, padding: "3px 9px", display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} /> Active Session
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <SettingRow label="Email Address" hint="Used for system notifications and password recovery.">
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Space Mono',monospace" }}>r.cruz@sti.edu.ph</span>
            </SettingRow>
            <SettingRow label="Role" hint="Your permission level within the SAS system." noBorder>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 8, padding: "5px 12px" }}>Registrar Admin</span>
            </SettingRow>
          </SectionCard>

          {/* Security */}
          <SectionCard icon={ShieldCheck} iconColor="#34d399" iconBg="rgba(52,211,153,0.1)" iconBorder="rgba(52,211,153,0.2)" title="Security" subtitle="Manage your login credentials and session security">
            <SettingRow label="Password" hint="Last changed 30 days ago. Use a strong, unique password." noBorder>
              <button onClick={() => setSPwModal(true)} className="ctrl-btn" style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                <KeyRound size={13} /> Change Password
              </button>
            </SettingRow>
          </SectionCard>

          {/* Save bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", background: "rgba(15,25,54,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Changes are applied immediately after saving.</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {settingsSaved && (
                <div className="save-toast" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4ade80", fontWeight: 600 }}>
                  <CheckCheck size={14} /> Saved successfully
                </div>
              )}
              <button className="ctrl-btn" onClick={() => { setSGrace(15); setGraceTime(15); setSWindow("3"); setSPrinter(false); setSMaxQueue(50); setSAutoAdvance(false); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 11, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                <RotateCw size={13} /> Reset Defaults
              </button>
              <button className="ctrl-btn" onClick={saveSettings} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 22px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 6px 20px rgba(37,99,235,0.35)" }}>
                <CheckCheck size={14} /> Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {sPwModal && (
          <div className="modal-backdrop" onClick={() => setSPwModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(8px)" }}>
            <div className="slide-in" onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#0f2057,#0d1a40)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 22, padding: "30px", width: 400, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><KeyRound size={17} color="#34d399" /></div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "white" }}>Change Password</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Rosa Cruz · Registrar</div>
                  </div>
                </div>
                <button onClick={() => setSPwModal(false)} style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={15} color="rgba(255,255,255,0.5)" />
                </button>
              </div>
              {[
                { label: "Current Password",  placeholder: "Enter current password" },
                { label: "New Password",      placeholder: "Min. 8 characters"      },
                { label: "Confirm Password",  placeholder: "Re-enter new password"  },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", marginBottom: 7, letterSpacing: "0.06em" }}>{f.label.toUpperCase()}</label>
                  <input type="password" placeholder={f.placeholder} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: 14, fontFamily: "'Outfit',sans-serif" }} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <button onClick={() => setSPwModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Cancel</button>
                <button onClick={() => setSPwModal(false)} className="ctrl-btn" style={{ flex: 2, padding: "12px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#059669,#047857)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 6px 20px rgba(5,150,105,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  <ShieldCheck size={14} /> Update Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ╔═══════════════════════════════════════════════════════════╗
  // ║  ROOT RENDER                                             ║
  // ╚═══════════════════════════════════════════════════════════╝
  return (
    <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", height: "100vh", display: "flex", background: "#0d1526", overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <aside style={{ width: sidebarCollapsed ? 64 : 220, flexShrink: 0, background: "linear-gradient(180deg,#0f1d3a 0%,#0d1526 100%)", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", transition: "width 0.3s cubic-bezier(.22,.68,0,1.2)", overflow: "hidden", position: "relative", zIndex: 10 }}>
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10, minHeight: 64 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(37,99,235,0.4)" }}>
            <GraduationCap size={18} color="white" />
          </div>
          {!sidebarCollapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: "white", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>SAS Admin</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>STI Calamba</div>
            </div>
          )}
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => {
            const active = activeNav === item.id;
            return (
              <button key={item.id} className="nav-btn" onClick={() => setActiveNav(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, background: active ? "rgba(37,99,235,0.25)" : "transparent", border: active ? "1px solid rgba(37,99,235,0.3)" : "1px solid transparent" }}>
                <item.icon size={17} color={active ? "#60a5fa" : "rgba(255,255,255,0.4)"} style={{ flexShrink: 0 }} />
                {!sidebarCollapsed && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#93c5fd" : "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>{item.label}</span>}
                {!sidebarCollapsed && active && <ChevronRight size={13} color="#60a5fa" style={{ marginLeft: "auto" }} />}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {!sidebarCollapsed && (
            <div style={{ padding: "10px 10px", marginBottom: 6, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 6, letterSpacing: "0.06em" }}>ADMIN</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white" }}>RC</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>Rosa Cruz</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Registrar</div>
                </div>
              </div>
            </div>
          )}
          <button className="nav-btn" onClick={() => setSidebarCollapsed(c => !c)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "9px", borderRadius: 9 }}>
            <ChevronRight size={15} color="rgba(255,255,255,0.3)" style={{ transform: sidebarCollapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s ease" }} />
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 64, flexShrink: 0, background: "rgba(13,21,38,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white", letterSpacing: "-0.01em" }}>{navItems.find(n => n.id === activeNav)?.label}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: paused ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.12)", border: `1px solid ${paused ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.25)"}`, borderRadius: 99, padding: "5px 12px" }}>
              {paused ? <PauseCircle size={12} color="#f59e0b" /> : <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />}
              <span style={{ fontSize: 11, color: paused ? "#fbbf24" : "#4ade80", fontWeight: 600 }}>{paused ? "QUEUE PAUSED" : "SYSTEM LIVE"}</span>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <Bell size={15} color="rgba(255,255,255,0.6)" />
              <div style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", background: "#ef4444", border: "1.5px solid #0d1526" }} />
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <LogOut size={15} color="rgba(255,255,255,0.6)" />
            </div>
          </div>
        </header>

        {/* Routed views */}
        {activeNav === "dashboard" && renderDashboard()}
        {activeNav === "queue"     && renderLiveQueue()}
        {activeNav === "history"   && renderHistory()}
        {activeNav === "settings"  && renderSettings()}
      </div>

      {/* ── WALK-IN MODAL ─────────────────────────────────────────── */}
      {walkInModal && (
        <div className="modal-backdrop" onClick={() => setWalkInModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(8px)" }}>
          <div className="slide-in" onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#0f2057,#0d1a40)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 22, padding: "28px", width: 400, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "white", letterSpacing: "-0.01em" }}>Add Walk-in Student</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Insert student directly into the queue</div>
              </div>
              <button onClick={() => setWalkInModal(false)} style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={15} color="rgba(255,255,255,0.5)" />
              </button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 7, letterSpacing: "0.06em" }}>FULL NAME</label>
              <input value={walkInName} onChange={e => setWalkInName(e.target.value)} placeholder="e.g. Juan dela Cruz" style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: 14, fontFamily: "'Outfit',sans-serif" }} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 7, letterSpacing: "0.06em" }}>PROGRAM / COURSE</label>
              <div style={{ position: "relative" }}>
                <select value={walkInCourse} onChange={e => setWalkInCourse(e.target.value)} style={{ width: "100%", padding: "11px 32px 11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,25,60,0.95)", color: walkInCourse ? "white" : "rgba(255,255,255,0.3)", fontSize: 14, fontFamily: "'Outfit',sans-serif", appearance: "none" }}>
                  <option value="">Select program…</option>
                  <optgroup label="Senior High School">{SHS_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}</optgroup>
                  <optgroup label="Tertiary / College">{TERTIARY_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}</optgroup>
                </select>
                <ChevronDown size={13} color="rgba(255,255,255,0.3)" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setWalkInModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 11, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Cancel</button>
              <button onClick={addWalkIn} disabled={!walkInName} className="ctrl-btn" style={{ flex: 2, padding: "12px", borderRadius: 11, border: "none", background: !walkInName ? "rgba(167,139,250,0.2)" : "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "white", fontSize: 13, fontWeight: 700, cursor: walkInName ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Outfit',sans-serif", boxShadow: walkInName ? "0 6px 20px rgba(124,58,237,0.4)" : "none" }}>
                <UserPlus size={14} /> Add to Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
