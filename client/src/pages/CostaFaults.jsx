import { useEffect, useMemo, useState } from "react";
import {
  Wrench,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Pencil,
  AlertTriangle,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { api } from "../lib/api";
import { getShell, getUser, setActiveShell } from "../lib/storage";

import ProfileMenu from "../components/ProfileMenu";
import ShellSwitcher from "../components/ShellSwitcher";
import CostaFaultDrawer from "../components/CostaFaultDrawer";

export default function CostaFaults() {
  const user = getUser();
  const isAdmin = user?.role === "super_admin";

  const [shell, setShellState] = useState(getShell());

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

  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "open" | "fixed"

  async function load() {
    if (!shell?._id) {
      setFaults([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/costa-faults?shellId=${shell._id}`);
      setFaults(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shell?._id]);

  async function submit(payload) {
    try {
      setSaving(true);
      if (editing?._id) {
        await api.patch(`/costa-faults/${editing._id}`, payload);
      } else {
        await api.post(`/costa-faults`, { ...payload, shellId: shell._id });
      }
      setDrawerOpen(false);
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function markFixed(f) {
    await api.patch(`/costa-faults/${f._id}`, {
      fixedAt: new Date().toISOString(),
    });
    await load();
  }

  async function reopen(f) {
    await api.patch(`/costa-faults/${f._id}`, { fixedAt: null });
    await load();
  }

  async function remove(f) {
    setConfirmDelete(null);
    await api.delete(`/costa-faults/${f._id}`);
    await load();
  }

  const counts = useMemo(() => {
    const open = faults.filter((f) => !f.fixedAt).length;
    const fixed = faults.length - open;
    return { all: faults.length, open, fixed };
  }, [faults]);

  // Sort open first, then by created date desc
  const visible = useMemo(() => {
    const sorted = [...faults].sort((a, b) => {
      const aOpen = !a.fixedAt;
      const bOpen = !b.fixedAt;
      if (aOpen !== bOpen) return aOpen ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    if (filter === "open") return sorted.filter((f) => !f.fixedAt);
    if (filter === "fixed") return sorted.filter((f) => f.fixedAt);
    return sorted;
  }, [faults, filter]);

  return (
    <div className="bg-shellbg p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 260px at 15% 25%, rgba(168,50,94,0.18) 0%, transparent 55%)," +
              "radial-gradient(700px 240px at 85% 30%, rgba(245,158,11,0.16) 0%, transparent 60%)",
          }}
        />
        <div className="relative p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider bg-[#6f1d3a]/10 text-[#6f1d3a] border border-[#6f1d3a]/15">
                  COSTA · MACHINE FAULTS
                </span>
                {counts.open > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border bg-amber-100 text-amber-800 border-amber-200">
                    <AlertTriangle className="w-3 h-3" /> {counts.open} open
                  </span>
                )}
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                {shell?.name ? `${shell.name} Costa machine log` : "Pick a shell"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                Log any issue with the Costa machine. Costa Maintenance updates the
                fixed date once an engineer attends.
              </p>
              <div className="mt-2">
                <ShellSwitcher tone="muted" onChange={setShellState} />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setEditing(null);
                  setDrawerOpen(true);
                }}
                disabled={!shell?._id}
                className="
                  inline-flex items-center gap-1.5
                  h-10 sm:h-11 px-3 sm:px-4 rounded-xl
                  bg-[#6f1d3a] hover:bg-[#5b1730]
                  text-white text-sm font-bold
                  shadow-sm active:scale-[0.99] transition
                  disabled:opacity-40
                "
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Log fault</span>
                <span className="sm:hidden">Log</span>
              </button>
              <ProfileMenu />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={filter === "all"}
              onClick={() => setFilter("all")}
              count={counts.all}
            >
              All
            </FilterChip>
            <FilterChip
              active={filter === "open"}
              onClick={() => setFilter("open")}
              count={counts.open}
              tone="amber"
            >
              <Clock className="w-3 h-3" />
              Open
            </FilterChip>
            <FilterChip
              active={filter === "fixed"}
              onClick={() => setFilter("fixed")}
              count={counts.fixed}
              tone="emerald"
            >
              <CheckCircle2 className="w-3 h-3" />
              Fixed
            </FilterChip>
          </div>
        </div>
      </div>

      {/* Body */}
      {!shell?._id ? (
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-sm text-gray-500">
          Pick a shell from the header to view its fault log.
        </div>
      ) : loading ? (
        <FaultListSkeleton />
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-sm text-gray-500">
          {filter === "open"
            ? "No open faults right now. Nice."
            : filter === "fixed"
            ? "Nothing fixed yet."
            : "No faults logged yet. Tap Log fault the next time the machine has an issue."}
        </div>
      ) : (
        <ul className="space-y-2 sm:space-y-3">
          {visible.map((f) => (
            <FaultRow
              key={f._id}
              fault={f}
              onEdit={() => {
                setEditing(f);
                setDrawerOpen(true);
              }}
              onMarkFixed={() => markFixed(f)}
              onReopen={() => reopen(f)}
              onDelete={() => setConfirmDelete(f)}
            />
          ))}
        </ul>
      )}

      <CostaFaultDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        fault={editing}
        onSubmit={submit}
        saving={saving}
      />

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this fault log?</AlertDialogTitle>
            <AlertDialogDescription>
              Removes "{confirmDelete?.fault}" from {confirmDelete?.date}. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => remove(confirmDelete)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function fmtDate(d) {
  if (!d) return "—";
  const x = new Date(d);
  if (Number.isNaN(x.valueOf())) return String(d);
  return x.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function fmtDateTime(d) {
  if (!d) return "—";
  const x = new Date(d);
  if (Number.isNaN(x.valueOf())) return String(d);
  return (
    x.toLocaleDateString([], { day: "2-digit", month: "short" }) +
    " · " +
    x.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

function FilterChip({ children, count, active, tone, onClick }) {
  const tones = {
    amber: active
      ? "bg-amber-500 text-white border-amber-500"
      : "bg-white text-amber-800 border-amber-200 hover:bg-amber-50",
    emerald: active
      ? "bg-emerald-600 text-white border-emerald-600"
      : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50",
    default: active
      ? "bg-gray-900 text-white border-gray-900"
      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11px] sm:text-xs font-bold transition active:scale-[0.99] ${
        tones[tone || "default"]
      }`}
    >
      {children}
      <span
        className={`min-w-5 h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
          active ? "bg-white/20" : "bg-gray-100 text-gray-700"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function FaultRow({ fault, onEdit, onMarkFixed, onReopen, onDelete }) {
  const fixed = !!fault.fixedAt;
  return (
    <li
      className={[
        "rounded-2xl border p-4 sm:p-5 shadow-sm",
        fixed ? "bg-white border-emerald-100" : "bg-white border-amber-200",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            fixed
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200",
          ].join(" ")}
        >
          {fixed ? <CheckCircle2 className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={[
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                fixed
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-amber-100 text-amber-800 border-amber-200",
              ].join(" ")}
            >
              {fixed ? "FIXED" : "OPEN"}
            </span>
            <span className="text-[11px] text-gray-500">
              {fmtDate(fault.date)}
            </span>
          </div>

          <div className="mt-1.5 font-semibold text-sm sm:text-base text-gray-900 break-words">
            {fault.fault}
          </div>

          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-[11px] sm:text-xs text-gray-600">
            <div>
              <b className="text-gray-700">Reported:</b>{" "}
              {fmtDateTime(fault.reportedAt)}
            </div>
            <div>
              <b className="text-gray-700">Fixed:</b> {fmtDateTime(fault.fixedAt)}
            </div>
            {fault.createdByStaffId?.name && (
              <div className="sm:col-span-2 text-gray-500">
                Logged by {fault.createdByStaffId.name}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {fixed ? (
          <button
            onClick={onReopen}
            className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition"
          >
            Mark as not fixed
          </button>
        ) : (
          <button
            onClick={onMarkFixed}
            className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-[0.99] transition inline-flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark fixed (now)
          </button>
        )}
        <button
          onClick={onEdit}
          className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition inline-flex items-center gap-1.5"
        >
          <Pencil className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={onDelete}
          className="h-9 px-3 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100 active:scale-[0.99] transition inline-flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </li>
  );
}

function FaultListSkeleton() {
  return (
    <ul className="space-y-2 sm:space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="rounded-2xl border border-gray-200 p-4 sm:p-5 bg-white space-y-2"
        >
          <div className="h-5 w-24 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
        </li>
      ))}
    </ul>
  );
}
