import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  Mail,
  ShieldCheck,
  UserCog,
  User as UserIcon,
  Building2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearSession, getUser } from "../lib/storage";

const roleStyle = {
  super_admin: {
    chip: "bg-amber-100 text-amber-800 border-amber-200",
    ring: "ring-amber-300/60",
    avatar: "bg-amber-600",
    Icon: ShieldCheck,
    label: "Super Admin",
  },
  manager: {
    chip: "bg-indigo-100 text-indigo-800 border-indigo-200",
    ring: "ring-indigo-300/60",
    avatar: "bg-indigo-600",
    Icon: UserCog,
    label: "Manager",
  },
  staff: {
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ring: "ring-emerald-300/60",
    avatar: "bg-emerald-600",
    Icon: UserIcon,
    label: "Staff",
  },
};

function firstInitial(name) {
  return String(name || "?")
    .trim()
    .charAt(0)
    .toUpperCase();
}

/**
 * Compact profile chip + dropdown.
 *
 *  - `variant="solid"` (default): a pill button with avatar + name (name hidden on `<sm`).
 *    Use on white/light surfaces (admin dashboard, costa/stock headers).
 *  - `variant="onDark"`: same shape but tuned for dark gradient surfaces (the login bar etc.).
 */
export default function ProfileMenu({ variant = "solid", className = "" }) {
  const nav = useNavigate();
  const loc = useLocation();
  const user = getUser();
  if (!user) return null;

  const role = roleStyle[user.role] || roleStyle.staff;
  const isAdmin = user.role === "super_admin";
  const onAdmin = loc.pathname.startsWith("/app/admin");

  function logout() {
    clearSession();
    nav("/", { replace: true });
  }

  const triggerBase =
    "inline-flex items-center gap-2 rounded-full focus:outline-none active:scale-[0.98] transition";
  const triggerSurface =
    variant === "onDark"
      ? "bg-white/10 border border-white/15 backdrop-blur-md text-white/95 hover:bg-white/15"
      : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 shadow-sm";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Account menu for ${user.name}`}
          className={`${triggerBase} ${triggerSurface} ${className}
            w-fit self-start sm:self-auto
            h-10 sm:h-11
            pl-1 pr-1 sm:pl-1.5 sm:pr-3
          `}
        >
          <span
            className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full ${role.avatar} text-white font-bold flex items-center justify-center text-sm sm:text-base shrink-0 ring-2 ring-white/80`}
          >
            {firstInitial(user.name)}
          </span>
          <span className="hidden sm:flex flex-col leading-tight min-w-0 max-w-[160px]">
            <span className="text-sm font-bold truncate">{user.name}</span>
            <span className={variant === "onDark" ? "text-[10px] text-white/70 truncate" : "text-[10px] text-gray-500 truncate"}>
              {role.label}
            </span>
          </span>
          <ChevronDown className="hidden sm:block w-4 h-4 opacity-60 shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 p-0 overflow-hidden rounded-2xl shadow-xl border bg-white"
      >
        {/* Identity card */}
        <div className="px-4 py-4 bg-gradient-to-br from-white to-gray-50 border-b">
          <div className="flex items-center gap-3">
            <span
              className={`w-11 h-11 rounded-full ${role.avatar} text-white font-extrabold flex items-center justify-center text-base ring-2 ring-white shrink-0`}
            >
              {firstInitial(user.name)}
            </span>
            <div className="min-w-0">
              <div className="font-extrabold text-gray-900 truncate text-[15px] leading-tight">
                {user.name}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${role.chip}`}
                >
                  <role.Icon className="w-3 h-3" />
                  {role.label}
                </span>
                {user.shell?.name && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-gray-100 text-gray-700 border-gray-200">
                    <Building2 className="w-3 h-3" />
                    {user.shell.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin shortcut */}
        {isAdmin && !onAdmin && (
          <DropdownMenuItem
            onSelect={() => nav("/app/admin")}
            className="cursor-pointer px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 focus:bg-gray-50"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Admin Dashboard
          </DropdownMenuItem>
        )}

        {isAdmin && !onAdmin && <DropdownMenuSeparator />}

        {/* Logout */}
        <DropdownMenuItem
          onSelect={logout}
          className="cursor-pointer px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 focus:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
