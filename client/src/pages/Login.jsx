import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { saveSession } from "../lib/storage";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [shells, setShells] = useState([]);
  const [staff, setStaff] = useState([]);
  const [shellId, setShellId] = useState("");
  const [staffId, setStaffId] = useState("");

  // ✅ live clock (UI only)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.get("/shells").then((res) => setShells(res.data.data));
  }, []);

  useEffect(() => {
    if (!shellId) return;
    api.get(`/staff/by-shell/${shellId}`).then((res) => setStaff(res.data.data));
  }, [shellId]);

  async function login() {
    const res = await api.post("/auth/login", { shellId, staffId });
    saveSession(res.data.data);
    nav("/app/diary");
  }

  // ✅ get selected shell name (UI only)
  const selectedShell = useMemo(
    () => shells.find((s) => s._id === shellId),
    [shells, shellId]
  );

  // ✅ background theme by shell name (UI only)
  const shellTheme = useMemo(() => {
    const name = (selectedShell?.name || "").toLowerCase();

    // pick vibes; tweak anytime
    if (name.includes("bullsmoor")) return { a: "#0b1220", b: "#1f3b73", glow: "#3b82f6" };
    if (name.includes("half")) return { a: "#0f1b16", b: "#14532d", glow: "#22c55e" };
    if (name.includes("enfield")) return { a: "#1a0f14", b: "#7f1d1d", glow: "#ef4444" };
    if (name.includes("epping")) return { a: "#0b1620", b: "#0e7490", glow: "#06b6d4" };
    if (name.includes("harlow")) return { a: "#140f1a", b: "#6d28d9", glow: "#a855f7" };
    if (name.includes("broxbourne")) return { a: "#111827", b: "#374151", glow: "#9ca3af" };
    if (name.includes("buckhurst")) return { a: "#0a1724", b: "#1d4ed8", glow: "#60a5fa" };
    if (name.includes("sawbridgeworth")) return { a: "#0d1b12", b: "#166534", glow: "#34d399" };

    // default
    return { a: "#0b1220", b: "#334155", glow: "#f59e0b" };
  }, [selectedShell]);

  const timeLabel = useMemo(() => {
    // nice readable clock
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [now]);

  const dateLabel = useMemo(() => {
    return now.toLocaleDateString([], { weekday: "long", month: "long", day: "2-digit" });
  }, [now]);

  return (
    <div
      className="h-full flex items-center justify-center px-6"
      style={{
        background: `radial-gradient(1100px 600px at 70% 20%, ${shellTheme.glow}22 0%, transparent 55%),
                     linear-gradient(135deg, ${shellTheme.a} 0%, ${shellTheme.b} 100%)`,
      }}
    >
      {/* subtle glass panel behind card */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_35%)]" />
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* top clock row */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-white/90">
            <div className="text-3xl font-extrabold leading-none">{timeLabel}</div>
            <div className="text-sm text-white/70 mt-1">{dateLabel}</div>
          </div>

          {/* shell pill */}
          <div className="px-3 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-white/85 text-sm">
            {selectedShell?.name ? (
              <span className="font-semibold">{selectedShell.name}</span>
            ) : (
              <span className="opacity-80">Select Shell</span>
            )}
          </div>
        </div>

        {/* main card */}
        <div className="bg-white/92 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-6 space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-gray-900">Station Diary</h1>
            <p className="text-sm text-gray-500 mt-1">
              Choose your shell & staff to continue
            </p>
          </div>

          {/* Shell select */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Shell
            </div>
            <select
              className="w-full h-12 rounded-xl border border-gray-200 bg-white px-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
              value={shellId}
              onChange={(e) => {
                setShellId(e.target.value);
                setStaffId(""); // UX: reset staff when shell changes (still same logic outcome)
              }}
            >
              <option value="">Select Shell</option>
              {shells.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Staff select */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Staff
            </div>
            <select
              className="w-full h-12 rounded-xl border border-gray-200 bg-white px-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              disabled={!shellId}
            >
              <option value="">{shellId ? "Select Staff" : "Select Shell first"}</option>
              {staff.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* login button */}
          <button
            onClick={login}
            disabled={!shellId || !staffId}
            className="
              w-full h-12 rounded-xl font-bold tracking-wide
              text-white
              bg-gradient-to-r from-red-600 to-red-700
              shadow-md
              hover:brightness-110
              active:scale-[0.99]
              transition
              disabled:opacity-40 disabled:active:scale-100
            "
          >
            LOGIN
          </button>

          {/* small footer */}
          <div className="text-center text-xs text-gray-500 pt-1">
            Greyskull • Station Operations
          </div>
        </div>
      </div>
    </div>
  );
}