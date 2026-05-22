import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid,
  Upload,
  CheckCircle2,
  Clock,
  Trash2,
  Maximize2,
  CalendarDays,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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
import PlanogramUploadDrawer from "../components/PlanogramUploadDrawer";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function fmtDateTime(d) {
  if (!d) return "—";
  const x = new Date(d);
  return (
    x.toLocaleDateString([], { day: "2-digit", month: "short" }) +
    " · " +
    x.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

export default function PlanogramPage() {
  const user = getUser();
  const isAdmin = user?.role === "super_admin";
  const canUpload = user?.role === "manager" || isAdmin;

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

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewer, setViewer] = useState(null); // full doc with photoDataUrl
  const [viewerLoading, setViewerLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filter, setFilter] = useState("all");

  async function load() {
    if (!shell?._id) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/planograms?shellId=${shell._id}`);
      setItems(res.data?.data || []);
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
      await api.post(`/planograms`, { ...payload, shellId: shell._id });
      setUploadOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function markLive(p) {
    await api.patch(`/planograms/${p._id}`, { markLive: true });
    await load();
  }
  async function unmarkLive(p) {
    await api.patch(`/planograms/${p._id}`, { markLive: false });
    await load();
  }
  async function remove(p) {
    setConfirmDelete(null);
    await api.delete(`/planograms/${p._id}`);
    await load();
  }

  async function openViewer(p) {
    try {
      setViewerLoading(true);
      setViewer({ ...p, photoDataUrl: null });
      const res = await api.get(`/planograms/${p._id}`);
      setViewer(res.data?.data || null);
    } finally {
      setViewerLoading(false);
    }
  }

  const counts = useMemo(
    () => ({
      all: items.length,
      pending: items.filter((p) => p.status !== "live").length,
      live: items.filter((p) => p.status === "live").length,
    }),
    [items]
  );

  const visible = useMemo(() => {
    if (filter === "pending") return items.filter((p) => p.status !== "live");
    if (filter === "live") return items.filter((p) => p.status === "live");
    return items;
  }, [items, filter]);

  return (
    <div className="bg-shellbg p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 260px at 15% 25%, rgba(139,92,246,0.20) 0%, transparent 55%)," +
              "radial-gradient(700px 240px at 85% 30%, rgba(99,102,241,0.18) 0%, transparent 60%)",
          }}
        />
        <div className="relative p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider bg-violet-100 text-violet-800 border border-violet-200">
                  <LayoutGrid className="w-3 h-3" /> PLANOGRAM
                </span>
                {counts.pending > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border bg-amber-100 text-amber-800 border-amber-200">
                    <Clock className="w-3 h-3" /> {counts.pending} pending
                  </span>
                )}
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                {shell?.name ? `${shell.name} planograms` : "Pick a shell"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                Managers upload new planograms each quarter (sent via the weekly
                newsletter). Once the team has set up the shop floor to match,
                anyone can tap <b>Mark live</b>.
              </p>
              <div className="mt-2">
                <ShellSwitcher tone="muted" onChange={setShellState} />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {canUpload && (
                <button
                  onClick={() => setUploadOpen(true)}
                  disabled={!shell?._id}
                  className="
                    inline-flex items-center gap-1.5
                    h-10 sm:h-11 px-3 sm:px-4 rounded-xl
                    bg-violet-600 hover:bg-violet-700
                    text-white text-sm font-bold
                    shadow-sm active:scale-[0.99] transition
                    disabled:opacity-40
                  "
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload</span>
                </button>
              )}
              <ProfileMenu />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={filter === "all"}
              onClick={() => setFilter("all")}
              count={counts.all}
            >
              All
            </FilterChip>
            <FilterChip
              active={filter === "pending"}
              onClick={() => setFilter("pending")}
              count={counts.pending}
              tone="amber"
            >
              <Clock className="w-3 h-3" />
              Pending
            </FilterChip>
            <FilterChip
              active={filter === "live"}
              onClick={() => setFilter("live")}
              count={counts.live}
              tone="emerald"
            >
              <CheckCircle2 className="w-3 h-3" />
              Live
            </FilterChip>
          </div>

          {!canUpload && (
            <div className="text-[11px] text-gray-500">
              Only managers and cluster admins can upload new planograms. Anyone
              can mark a planogram as live once the shop floor matches.
            </div>
          )}
        </div>
      </div>

      {!shell?._id ? (
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-sm text-gray-500">
          Pick a shell from the header to view its planograms.
        </div>
      ) : loading ? (
        <PlanogramSkeleton />
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-sm text-gray-500">
          {filter === "pending"
            ? "No pending planograms — everything is live."
            : filter === "live"
            ? "Nothing live yet."
            : "No planograms uploaded yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {visible.map((p) => (
            <PlanogramCard
              key={p._id}
              p={p}
              canDelete={canUpload}
              onOpen={() => openViewer(p)}
              onMarkLive={() => markLive(p)}
              onUnmarkLive={() => unmarkLive(p)}
              onDelete={() => setConfirmDelete(p)}
            />
          ))}
        </div>
      )}

      {/* Upload */}
      <PlanogramUploadDrawer
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={submit}
        saving={saving}
      />

      {/* Full-screen viewer */}
      <Dialog open={!!viewer} onOpenChange={(o) => !o && setViewer(null)}>
        <DialogContent
          aria-describedby={undefined}
          className="
            w-[96vw] sm:w-[95vw] max-w-[96vw] sm:max-w-[1100px]
            h-[90vh] sm:h-[92vh]
            p-0 overflow-hidden rounded-2xl flex flex-col
          "
        >
          <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b bg-white flex items-center gap-3">
            <LayoutGrid className="w-4 h-4 text-violet-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                {viewer?.title}
              </div>
              {viewer?.notes && (
                <div className="text-[11px] sm:text-xs text-gray-500 truncate">
                  {viewer.notes}
                </div>
              )}
            </div>
            <span
              className={[
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0",
                viewer?.status === "live"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-amber-100 text-amber-800 border-amber-200",
              ].join(" ")}
            >
              {viewer?.status === "live" ? "LIVE" : "PENDING"}
            </span>
          </div>
          <div className="flex-1 min-h-0 bg-black flex items-center justify-center overflow-auto">
            {viewerLoading || !viewer?.photoDataUrl ? (
              <div className="text-white/70 text-sm">Loading photo…</div>
            ) : (
              <img
                src={viewer.photoDataUrl}
                alt={viewer.title}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this planogram?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDelete?.title}" will be removed permanently.
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

function PlanogramCard({
  p,
  canDelete,
  onOpen,
  onMarkLive,
  onUnmarkLive,
  onDelete,
}) {
  const live = p.status === "live";

  // /api/planograms list omits photoDataUrl for perf — use a small preview via
  // background colour, the user clicks to open the viewer for the full image.
  // To show a thumbnail without the heavy blob, we lazy-fetch it once.
  const [thumb, setThumb] = useState(null);
  useEffect(() => {
    let cancelled = false;
    api
      .get(`/planograms/${p._id}`)
      .then((res) => {
        if (!cancelled) setThumb(res.data?.data?.photoDataUrl || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [p._id]);

  return (
    <div
      className={[
        "bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col",
        live ? "border-emerald-100" : "border-amber-200",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onOpen}
        className="relative block bg-gray-100 aspect-[4/3] overflow-hidden group"
      >
        {thumb ? (
          <img
            src={thumb}
            alt={p.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            <LayoutGrid className="w-8 h-8 opacity-30" />
          </div>
        )}
        <span
          className={[
            "absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
            live
              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
              : "bg-amber-100 text-amber-800 border-amber-200",
          ].join(" ")}
        >
          {live ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {live ? "LIVE" : "PENDING"}
        </span>
        <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white">
          <Maximize2 className="w-3 h-3" />
          Tap to view
        </span>
      </button>

      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
        <div className="font-semibold text-sm sm:text-base text-gray-900 leading-snug line-clamp-2">
          {p.title}
        </div>
        {p.notes && (
          <div className="text-[11px] sm:text-xs text-gray-500 line-clamp-2">
            {p.notes}
          </div>
        )}

        <div className="text-[11px] text-gray-500 mt-1 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3 shrink-0" />
            Uploaded {fmtDate(p.createdAt)} · {p.uploadedByStaffId?.name || "—"}
          </div>
          {live && (
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              Live since {fmtDateTime(p.markedLiveAt)}
              {p.markedLiveByStaffId?.name && ` · ${p.markedLiveByStaffId.name}`}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {live ? (
            <button
              onClick={onUnmarkLive}
              className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition"
            >
              Mark not live
            </button>
          ) : (
            <button
              onClick={onMarkLive}
              className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 active:scale-[0.99] transition"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark live
            </button>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              className="h-9 px-3 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100 active:scale-[0.99] transition inline-flex items-center gap-1.5 ml-auto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanogramSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border shadow-sm overflow-hidden"
        >
          <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
          <div className="p-3 sm:p-4 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
