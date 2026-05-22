import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  ShieldCheck,
  UserCog,
  UserPlus,
  Trash2,
  Search,
  ChevronRight,
  KeyRound,
  ArrowRight,
} from "lucide-react";

import { api } from "../lib/api";
import { getUser, setActiveShell } from "../lib/storage";
import ProfileMenu from "../components/ProfileMenu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleStyle = {
  super_admin: "bg-amber-100 text-amber-800 border-amber-200",
  manager: "bg-indigo-100 text-indigo-800 border-indigo-200",
  staff: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const roleLabel = {
  super_admin: "Super Admin",
  manager: "Manager",
  staff: "Staff",
};

function slugify(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export default function AdminDashboard() {
  const me = getUser();
  const nav = useNavigate();

  function visitShell(shell) {
    setActiveShell(shell);
    nav("/app/diary");
  }

  const [shells, setShells] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeShell, setActiveShellLocal] = useState(null); // {_id, name} or null
  const [createOpen, setCreateOpen] = useState(false);
  const [createSuperOpen, setCreateSuperOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [resetUser, setResetUser] = useState(null);

  const [search, setSearch] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      const [shellsRes, staffRes] = await Promise.all([
        api.get("/shells"),
        api.get("/staff"),
      ]);
      setShells(shellsRes.data.data || []);
      setStaff(staffRes.data.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Build counts per shell
  const countsByShell = useMemo(() => {
    const map = new Map();
    for (const u of staff) {
      const sid = u?.shellId?._id || u?.shellId;
      if (!sid) continue;
      if (!map.has(sid)) map.set(sid, { manager: 0, staff: 0 });
      const bucket = map.get(sid);
      if (u.role === "manager") bucket.manager += 1;
      if (u.role === "staff") bucket.staff += 1;
    }
    return map;
  }, [staff]);

  const filteredShells = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return shells;
    return shells.filter((s) => s.name.toLowerCase().includes(q));
  }, [shells, search]);

  const totals = useMemo(() => {
    return {
      shells: shells.length,
      managers: staff.filter((u) => u.role === "manager").length,
      staff: staff.filter((u) => u.role === "staff").length,
    };
  }, [shells, staff]);

  return (
    <div className="bg-shellbg p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(900px 260px at 10% 20%, rgba(245,158,11,0.18) 0%, transparent 55%)," +
              "radial-gradient(700px 240px at 85% 30%, rgba(99,102,241,0.18) 0%, transparent 60%)",
          }}
        />
        <div className="relative p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                <ShieldCheck className="w-3.5 h-3.5" /> CLUSTER ADMIN
              </span>
              <span className="text-xs text-gray-500 truncate">
                Signed in as <b className="text-gray-700">{me?.name}</b> · {me?.email}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mt-1.5">
              Cluster Manager Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Create and manage managers & staff for every shell.
            </p>
          </div>

          <ProfileMenu className="shrink-0" />
        </div>

        {/* Stat strip */}
        <div className="relative grid grid-cols-3 border-t bg-white/50">
          <Stat icon={Building2} value={totals.shells} label="Shells" tone="text-sky-700" />
          <Stat icon={UserCog} value={totals.managers} label="Managers" tone="text-indigo-700" />
          <Stat icon={Users} value={totals.staff} label="Staff" tone="text-emerald-700" />
        </div>
      </div>

      {/* Search + super admin shortcut */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shells..."
            className="
              w-full h-11 rounded-xl
              border border-gray-200 bg-white pl-9 pr-3
              text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-red-500/30
            "
          />
        </div>
        <button
          onClick={() => setCreateSuperOpen(true)}
          className="
            shrink-0 inline-flex items-center gap-1.5
            h-11 px-3 sm:px-4 rounded-xl
            bg-amber-500 hover:bg-amber-600
            text-white text-sm font-bold
            shadow-sm active:scale-[0.99] transition
          "
          title="Create another super admin"
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Add super admin</span>
          <span className="sm:hidden">Super</span>
        </button>
      </div>

      {/* Shell grid */}
      {loading ? (
        <ShellsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredShells.map((s) => {
            const counts = countsByShell.get(s._id) || { manager: 0, staff: 0 };
            return (
              <div
                key={s._id}
                className="
                  bg-white rounded-2xl border shadow-sm
                  hover:shadow-md
                  transition
                  p-4 sm:p-5
                  flex flex-col gap-3
                "
              >
                <button
                  onClick={() => setActiveShellLocal(s)}
                  className="text-left -m-2 p-2 rounded-xl hover:bg-gray-50 active:scale-[0.99] transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="font-extrabold text-base sm:text-lg text-gray-900 truncate">
                          {s.name}
                        </div>
                      </div>
                      {s.locationName && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {s.locationName}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                  </div>
                </button>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <UserCog className="w-3.5 h-3.5" /> {counts.manager} manager{counts.manager === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Users className="w-3.5 h-3.5" /> {counts.staff} staff
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t mt-1">
                  <button
                    onClick={() => setActiveShellLocal(s)}
                    className="
                      flex-1 inline-flex items-center justify-center gap-1.5
                      h-9 sm:h-10 px-3
                      rounded-xl
                      bg-gray-100 hover:bg-gray-200
                      text-xs sm:text-sm font-bold text-gray-800
                      active:scale-[0.99] transition
                    "
                  >
                    <UserCog className="w-4 h-4" />
                    Manage members
                  </button>
                  <button
                    onClick={() => visitShell(s)}
                    className="
                      flex-1 inline-flex items-center justify-center gap-1.5
                      h-9 sm:h-10 px-3
                      rounded-xl
                      bg-red-600 hover:bg-red-700
                      text-xs sm:text-sm font-bold text-white
                      active:scale-[0.99] transition
                    "
                  >
                    Open station
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredShells.length === 0 && (
            <div className="col-span-full text-center py-10 text-sm text-gray-500 bg-white rounded-2xl border">
              No shells match “{search}”.
            </div>
          )}
        </div>
      )}

      {/* Shell drawer/dialog */}
      <Dialog open={!!activeShell} onOpenChange={(o) => !o && setActiveShellLocal(null)}>
        <DialogContent
          aria-describedby={undefined}
          className="
            w-[96vw] sm:w-[95vw] max-w-[720px]
            max-h-[90vh] p-0 rounded-2xl
            flex flex-col overflow-hidden
          "
        >
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-5">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="text-base sm:text-lg flex items-center gap-2 min-w-0">
                <Building2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{activeShell?.name} — members</span>
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-3 flex items-center gap-2 border-b">
            <button
              onClick={() => setCreateOpen(true)}
              className="
                inline-flex items-center gap-1.5
                h-10 px-3 rounded-xl
                bg-red-600 hover:bg-red-700
                text-white text-sm font-bold
                active:scale-[0.99] transition
              "
            >
              <UserPlus className="w-4 h-4" />
              Add member
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2">
            {staff
              .filter((u) => {
                const sid = u?.shellId?._id || u?.shellId;
                return sid === activeShell?._id;
              })
              .sort((a, b) => {
                // managers first
                if (a.role !== b.role) return a.role === "manager" ? -1 : 1;
                return a.name.localeCompare(b.name);
              })
              .map((u) => (
                <StaffRow
                  key={u._id}
                  user={u}
                  onDelete={() => setConfirmDelete(u)}
                  onResetPassword={() => setResetUser(u)}
                />
              ))}

            {staff.filter((u) => {
              const sid = u?.shellId?._id || u?.shellId;
              return sid === activeShell?._id;
            }).length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500">
                No members yet. Click <b>Add member</b> to create one.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create member dialog (per-shell, defaults to staff) */}
      <CreateMemberDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        shell={activeShell}
        initialRole="staff"
        onCreated={async () => {
          setCreateOpen(false);
          await loadAll();
        }}
      />

      {/* Create super admin dialog (no shell, defaults to super_admin) */}
      <CreateMemberDialog
        open={createSuperOpen}
        onClose={() => setCreateSuperOpen(false)}
        shell={null}
        initialRole="super_admin"
        onCreated={async () => {
          setCreateSuperOpen(false);
          await loadAll();
        }}
      />

      {/* Reset password dialog */}
      <ResetPasswordDialog
        user={resetUser}
        onClose={() => setResetUser(null)}
        onDone={async () => {
          setResetUser(null);
          await loadAll();
        }}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this member?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.name} ({confirmDelete?.email}) will no longer be
              able to sign in. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const u = confirmDelete;
                setConfirmDelete(null);
                if (!u) return;
                await api.delete(`/staff/${u._id}`);
                await loadAll();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({ icon: Icon, value, label, tone }) {
  return (
    <div className="px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-3">
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border flex items-center justify-center ${tone}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-lg sm:text-xl font-extrabold text-gray-900 leading-none tabular-nums">
          {value}
        </div>
        <div className="text-[11px] sm:text-xs text-gray-500 mt-1 truncate">
          {label}
        </div>
      </div>
    </div>
  );
}

function StaffRow({ user, onDelete, onResetPassword }) {
  return (
    <div className="rounded-xl border bg-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 shrink-0">
        {user.name?.[0]?.toUpperCase() || "?"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">
            {user.name}
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border ${roleStyle[user.role]}`}
          >
            {roleLabel[user.role]}
          </span>
        </div>
        <div className="text-xs text-gray-500 truncate">{user.email}</div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={onResetPassword}
          className="inline-flex items-center justify-center h-9 w-9 sm:w-auto sm:px-3 gap-1 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.99] transition text-xs font-bold text-gray-700"
          title="Reset password"
        >
          <KeyRound className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center justify-center h-9 w-9 sm:w-auto sm:px-3 gap-1 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 active:scale-[0.99] transition text-xs font-bold text-red-700"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Remove</span>
        </button>
      </div>
    </div>
  );
}

function CreateMemberDialog({ open, onClose, shell, initialRole = "staff", onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialRole);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setRole(initialRole);
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole(initialRole);
      setErr("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // suggest email when name changes — just <name>@grayskull.com
  useEffect(() => {
    if (!name) return;
    const suggested = `${slugify(name)}@grayskull.com`;
    if (!email || email.endsWith("@grayskull.com")) setEmail(suggested);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  async function submit(e) {
    e?.preventDefault?.();
    setErr("");
    if (!name.trim() || !email.trim() || !password) {
      setErr("Name, email, and password are required.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    try {
      setSaving(true);
      await api.post("/staff", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        // super_admin records are cluster-wide and don't need a shell
        shellId: role === "super_admin" ? null : shell?._id,
      });
      await onCreated();
    } catch (e2) {
      const code = e2?.response?.data?.message;
      setErr(
        code === "EMAIL_ALREADY_USED"
          ? "That email is already in use."
          : code === "PASSWORD_MIN_6_CHARS"
          ? "Password must be at least 6 characters."
          : "Couldn't create member. Try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="w-[96vw] sm:w-[95vw] max-w-[480px] rounded-2xl p-5 sm:p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {role === "super_admin"
              ? "Add a new super admin"
              : `Add member to ${shell?.name || "this shell"}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3 sm:space-y-4">
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@grayskull.com"
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </Field>

          <Field label="Temporary password (min 6 chars)">
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Welcome@123"
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </Field>

          <Field label="Role">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-11 rounded-xl text-base">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin (cluster-wide)</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {err && (
            <div className="text-sm text-red-600 font-medium bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {err}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-11 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex-1 disabled:opacity-50 active:scale-[0.99] transition order-1 sm:order-2"
            >
              {saving ? "Creating…" : "Create member"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({ user, onClose, onDone }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setPw("");
      setErr("");
    }
  }, [user]);

  async function submit(e) {
    e?.preventDefault?.();
    setErr("");
    if (pw.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    try {
      setSaving(true);
      await api.patch(`/staff/${user._id}`, { password: pw });
      await onDone();
    } catch {
      setErr("Couldn't update password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="w-[96vw] max-w-[420px] rounded-2xl p-5"
      >
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            Reset password
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-gray-500 -mt-2">
          Sets a new password for <b className="text-gray-700">{user?.name}</b>{" "}
          ({user?.email}).
        </p>

        <form onSubmit={submit} className="space-y-3 mt-2">
          <Field label="New password">
            <input
              type="text"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </Field>
          {err && (
            <div className="text-sm text-red-600 font-medium bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {err}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-11 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex-1 order-1 sm:order-2 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Update password"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[11px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

function ShellsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gray-200 animate-pulse" />
            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
