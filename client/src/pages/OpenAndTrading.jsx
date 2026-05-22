import { useEffect, useMemo, useRef, useState } from "react";
import {
  DoorOpen,
  DoorClosed,
  Clock,
  Key,
  LogOut,
  CalendarDays,
  History,
  Sparkles,
} from "lucide-react";

import { api } from "../lib/api";
import { getUser, getShell, setActiveShell } from "../lib/storage";

import ProfileMenu from "../components/ProfileMenu";
import ShellSwitcher from "../components/ShellSwitcher";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function nowHHmm() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function hhmmToMinutes(s) {
  if (!s) return null;
  const [h, m] = s.split(":").map(Number);
  return h * 60 + (m || 0);
}

function fmtTimeNice(s) {
  if (!s) return "—";
  // "07:00" → "7:00 AM"
  const [h, m] = s.split(":").map(Number);
  const hr12 = ((h + 11) % 12) + 1;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hr12}:${pad2(m || 0)} ${ampm}`;
}

function addMinutes(hhmm, mins) {
  const total = hhmmToMinutes(hhmm) + mins;
  const h = Math.floor(((total % 1440) + 1440) % 1440 / 60);
  const m = ((total % 60) + 60) % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

function StatusBadge({ tone, children }) {
  const tones = {
    open: "bg-emerald-100 text-emerald-800 border-emerald-200",
    closed: "bg-gray-100 text-gray-700 border-gray-200",
    pre: "bg-amber-100 text-amber-800 border-amber-200",
    closing: "bg-orange-100 text-orange-800 border-orange-200",
    always: "bg-sky-100 text-sky-800 border-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wider border ${tones[tone] || tones.closed}`}
    >
      {children}
    </span>
  );
}

function computeStatus(shell, log) {
  // Default to 24/7 unless the document explicitly has is24x7 === false,
  // so older Shell docs without the field still render correctly.
  if (!shell || shell.is24x7 !== false) {
    return { tone: "always", label: "24/7 — ALWAYS OPEN" };
  }

  const now = hhmmToMinutes(nowHHmm());
  const opensAt = hhmmToMinutes(shell.opensAt);
  const closesAt = hhmmToMinutes(shell.closesAt);
  const loginAt = opensAt - (shell.loginLeadMinutes || 30);
  const signoffAt = closesAt + (shell.signoffLagMinutes || 5);

  if (log?.closedAt) {
    return { tone: "closed", label: `CLOSED · ${fmtTimeNice(log.closedAt)}` };
  }
  if (log?.openedAt) {
    if (now >= closesAt && now < signoffAt) {
      return { tone: "closing", label: "CLOSING — SIGN OFF FROM TILL" };
    }
    if (now >= signoffAt) {
      return { tone: "closing", label: "OVERDUE — LOG CLOSE TIME" };
    }
    return { tone: "open", label: `OPEN · since ${fmtTimeNice(log.openedAt)}` };
  }

  if (now < loginAt) return { tone: "closed", label: `CLOSED · opens ${fmtTimeNice(shell.opensAt)}` };
  if (now < opensAt) return { tone: "pre", label: "LOG IN TO TILL NOW" };
  // past opensAt with no log recorded → staff need to tap Log open time
  return { tone: "closing", label: "OVERDUE — LOG OPEN TIME" };
}

export default function OpenAndTrading() {
  const user = getUser();
  const isAdmin = user?.role === "super_admin";

  const [shell, setShellState] = useState(getShell());
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // "open" | "close" | null
  const [now, setNow] = useState(nowHHmm());

  // For super_admin landing here with no shell picked yet
  useEffect(() => {
    if (shell || !isAdmin) return;
    api
      .get("/shells")
      .then((res) => {
        const first = res.data?.data?.[0];
        if (!first) return;
        setActiveShell(first);
        setShellState(first);
      })
      .catch(() => {});
  }, [shell, isAdmin]);

  // Tick the clock so the status auto-updates without reload
  useEffect(() => {
    const t = setInterval(() => setNow(nowHHmm()), 30_000);
    return () => clearInterval(t);
  }, []);

  async function loadDay() {
    if (!shell?._id) {
      setData(null);
      setHistory([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [dayRes, histRes] = await Promise.all([
        api.get(`/trading?shellId=${shell._id}`),
        api.get(`/trading/history?shellId=${shell._id}&limit=14`),
      ]);
      setData(dayRes.data?.data || null);
      setHistory(histRes.data?.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shell?._id]);

  const log = data?.log;
  const shellRich = data?.shell || shell;

  const status = useMemo(
    () => computeStatus(shellRich, log),
    // re-evaluate when the clock ticks
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shellRich, log, now]
  );

  async function logOpen(time) {
    try {
      setSaving("open");
      await api.post("/trading/open", { shellId: shell._id, time });
      await loadDay();
    } finally {
      setSaving(null);
    }
  }

  async function logClose(time) {
    try {
      setSaving("close");
      await api.post("/trading/close", { shellId: shell._id, time });
      await loadDay();
    } finally {
      setSaving(null);
    }
  }

  const is247 = !shellRich || shellRich.is24x7 !== false;
  const opensAt = shellRich?.opensAt;
  const closesAt = shellRich?.closesAt;
  const loginBy = opensAt
    ? addMinutes(opensAt, -(shellRich.loginLeadMinutes || 30))
    : null;
  const signoffBy = closesAt
    ? addMinutes(closesAt, shellRich.signoffLagMinutes || 5)
    : null;

  const dateLabel = useMemo(() => {
    return new Date().toLocaleDateString([], {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  }, []);

  return (
    <div className="bg-shellbg p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(900px 260px at 15% 25%, rgba(16,185,129,0.18) 0%, transparent 55%)," +
              "radial-gradient(700px 240px at 85% 30%, rgba(245,158,11,0.16) 0%, transparent 60%)",
          }}
        />
        <div className="relative p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  OPEN &amp; TRADING
                </span>
                <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {dateLabel}
                </span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                {shellRich?.name || "Pick a shell"} Station
              </h1>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <StatusBadge tone={status.tone}>
                  {is247 ? <Sparkles className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {status.label}
                </StatusBadge>
                <ShellSwitcher tone="muted" onChange={setShellState} />
              </div>
            </div>
            <ProfileMenu className="shrink-0" />
          </div>
        </div>
      </div>

      {!shellRich ? (
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-sm text-gray-500">
          Pick a shell from the top to view its trading status.
        </div>
      ) : loading ? (
        <Skeleton />
      ) : is247 ? (
        <AlwaysOpenCard shellName={shellRich.name} />
      ) : (
        <>
          {/* Trading hours card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <Card title="Trading hours" Icon={Clock}>
              <Row label="Opens" value={fmtTimeNice(opensAt)} tone="emerald" />
              <Row label="Closes" value={fmtTimeNice(closesAt)} tone="rose" />
            </Card>

            <Card title="Till routine" Icon={Key}>
              <Row
                label="Log in to till by"
                hint={`${shellRich.loginLeadMinutes || 30} min before open`}
                value={fmtTimeNice(loginBy)}
                tone="amber"
                Icon={Key}
              />
              <Row
                label="Sign off till by"
                hint={`${shellRich.signoffLagMinutes || 5} min after close`}
                value={fmtTimeNice(signoffBy)}
                tone="indigo"
                Icon={LogOut}
              />
            </Card>
          </div>

          {/* Today's log + action buttons */}
          <div className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-extrabold text-sm sm:text-base text-gray-900">
                Today's log
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 tabular-nums">
                Now: {now}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LogPanel
                Icon={DoorOpen}
                label="Opened"
                time={log?.openedAt}
                byName={log?.openedByStaffId?.name}
                tone="emerald"
                buttonLabel={log?.openedAt ? "Update open time" : "Log open time"}
                onClick={logOpen}
                disabled={saving !== null}
                saving={saving === "open"}
              />
              <LogPanel
                Icon={DoorClosed}
                label="Closed"
                time={log?.closedAt}
                byName={log?.closedByStaffId?.name}
                tone="rose"
                buttonLabel={log?.closedAt ? "Update close time" : "Log close time"}
                onClick={logClose}
                disabled={saving !== null || !log?.openedAt}
                saving={saving === "close"}
              />
            </div>
            {!log?.openedAt && (
              <div className="text-[11px] sm:text-xs text-gray-500">
                Tip: the person who opens the till each day taps <b>Log open time</b>. At
                close, the person who closes taps <b>Log close time</b>. Times default to
                "right now".
              </div>
            )}
          </div>

          {/* History */}
          <div className="bg-white rounded-2xl border shadow-sm">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              <div className="font-extrabold text-sm sm:text-base text-gray-900">
                Recent days
              </div>
              <div className="ml-auto text-[11px] sm:text-xs text-gray-500">
                last {history.length} day{history.length === 1 ? "" : "s"}
              </div>
            </div>

            {history.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No logs yet — the first time someone opens/closes the station, it'll show
                up here.
              </div>
            ) : (
              <ul className="divide-y">
                {history.map((h) => (
                  <li
                    key={h._id}
                    className="px-4 sm:px-5 py-3 grid grid-cols-[1fr_auto] sm:grid-cols-[100px_1fr_1fr] items-center gap-2 sm:gap-3"
                  >
                    <div className="text-xs sm:text-sm font-bold text-gray-900 tabular-nums">
                      {h.date}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 flex items-center gap-2 sm:col-start-2">
                      <DoorOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="tabular-nums">{h.openedAt || "—"}</span>
                      {h.openedByStaffId?.name && (
                        <span className="text-gray-500 truncate">
                          · {h.openedByStaffId.name}
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 flex items-center gap-2 col-span-2 sm:col-span-1 sm:col-start-3">
                      <DoorClosed className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="tabular-nums">{h.closedAt || "—"}</span>
                      {h.closedByStaffId?.name && (
                        <span className="text-gray-500 truncate">
                          · {h.closedByStaffId.name}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function AlwaysOpenCard({ shellName }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5 sm:p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0">
        <Sparkles className="w-6 h-6 text-sky-700" />
      </div>
      <div className="min-w-0">
        <div className="font-extrabold text-base sm:text-lg text-gray-900 truncate">
          {shellName} runs 24/7
        </div>
        <p className="text-sm text-gray-600 mt-0.5">
          No daily open / close logging needed for this station.
        </p>
      </div>
    </div>
  );
}

function Card({ title, Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <div className="font-extrabold text-sm sm:text-base text-gray-900">
          {title}
        </div>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, hint, value, tone = "emerald", Icon }) {
  const tones = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-100",
    rose: "text-rose-700 bg-rose-50 border-rose-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    indigo: "text-indigo-700 bg-indigo-50 border-indigo-100",
  };
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">
          {label}
        </div>
        {hint && <div className="text-[11px] text-gray-500 truncate">{hint}</div>}
      </div>
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold tabular-nums shrink-0 ${tones[tone]}`}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {value}
      </div>
    </div>
  );
}

function LogPanel({ Icon, label, time, byName, tone, buttonLabel, onClick, disabled, saving }) {
  const tones = {
    emerald: {
      chip: "bg-emerald-50 text-emerald-800 border-emerald-200",
      btn: "bg-emerald-600 hover:bg-emerald-700",
      ring: "focus:ring-emerald-500/30 border-emerald-200",
    },
    rose: {
      chip: "bg-rose-50 text-rose-800 border-rose-200",
      btn: "bg-rose-600 hover:bg-rose-700",
      ring: "focus:ring-rose-500/30 border-rose-200",
    },
  };

  // Time the user has picked (or will submit). Starts at the existing log time
  // if there is one, otherwise the current clock. Stays in sync when the prop
  // changes (e.g. after a successful save).
  const [picked, setPicked] = useState(time || nowHHmm());
  const inputRef = useRef(null);
  useEffect(() => {
    setPicked(time || nowHHmm());
  }, [time]);

  const dirty = !!time && picked !== time;
  const isDisabled = disabled || !picked;

  return (
    <div className="rounded-xl border p-3 sm:p-4 flex flex-col gap-3 bg-gray-50/40">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${tones[tone].chip}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
          {label}
        </div>
      </div>

      <div className="min-h-[3rem]">
        {time ? (
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tabular-nums">
              {time}
            </div>
            <div className="text-xs text-gray-500 truncate">
              by {byName || "—"}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">Not yet logged today</div>
        )}
      </div>

      {/* Manual time picker */}
      <div>
        <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
          {time ? "Adjust to" : "Select time"}
        </div>
        <div className="flex items-stretch gap-2">
          <input
            ref={inputRef}
            type="time"
            step="60"
            value={picked}
            onChange={(e) => setPicked(e.target.value)}
            disabled={disabled && !time}
            className={`
              flex-1 h-11 rounded-xl border bg-white px-3
              text-base font-bold tabular-nums
              focus:outline-none focus:ring-2
              ${tones[tone].ring}
              disabled:bg-gray-100 disabled:text-gray-400
            `}
          />
          <button
            type="button"
            onClick={() => setPicked(nowHHmm())}
            disabled={disabled && !time}
            className="
              h-11 px-3 rounded-xl border border-gray-200 bg-white
              text-xs font-bold text-gray-700
              hover:bg-gray-50 active:scale-[0.99] transition
              disabled:opacity-50
            "
            title="Set to current time"
          >
            Now
          </button>
        </div>
      </div>

      <button
        onClick={() => onClick(picked)}
        disabled={isDisabled}
        className={`
          h-11 rounded-xl text-white text-sm font-bold
          ${tones[tone].btn}
          active:scale-[0.99] transition
          disabled:opacity-40 disabled:active:scale-100
        `}
      >
        {saving
          ? "Saving…"
          : time && !dirty
          ? "Save again"
          : buttonLabel}
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5 space-y-3">
            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-full rounded bg-gray-100 animate-pulse" />
            <div className="h-6 w-full rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5 space-y-3">
        <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-32 rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-32 rounded-xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
