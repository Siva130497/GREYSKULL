import { useEffect, useState } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { api } from "../lib/api";
import { getShell, getUser, setActiveShell } from "../lib/storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Shows the active shell and (for super_admin only) lets them switch.
 *
 *  - For managers/staff: the shell is fixed to their assignment — renders as a
 *    static read-only pill.
 *  - For super_admin: renders as a dropdown of every shell. Picking one calls
 *    setActiveShell() then `onChange()` so the parent page can refetch.
 *
 * `tone` controls the visual surface:
 *  - "white" (default): white pill, dark text — for white headers.
 *  - "muted":           subtle gray pill — for top bars.
 */
export default function ShellSwitcher({
  onChange,
  tone = "white",
  className = "",
}) {
  const user = getUser();
  const currentShell = getShell();
  const isAdmin = user?.role === "super_admin";

  const [shells, setShells] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    api
      .get("/shells")
      .then((res) => setShells(res.data?.data || []))
      .catch(() => setShells([]))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  function switchTo(shell) {
    if (!shell || shell._id === currentShell?._id) return;
    setActiveShell(shell);
    onChange?.(shell);
  }

  const toneClasses =
    tone === "muted"
      ? "bg-gray-100 hover:bg-gray-200 text-gray-800 border-transparent"
      : "bg-white hover:bg-gray-50 text-gray-900 border-gray-200 shadow-sm";

  // Read-only chip for non-admins
  if (!isAdmin) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border ${toneClasses} h-9 sm:h-10 px-2.5 sm:px-3 ${className}`}
      >
        <Building2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
        <span className="text-xs sm:text-sm font-semibold truncate max-w-[160px]">
          {currentShell?.name || "—"}
        </span>
      </div>
    );
  }

  // Switcher dropdown for super_admin
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Switch shell"
          className={`inline-flex items-center gap-1.5 rounded-full border transition active:scale-[0.98] ${toneClasses} h-9 sm:h-10 px-2.5 sm:px-3 ${className}`}
        >
          <Building2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold truncate max-w-[140px]">
            {currentShell?.name || "Pick a shell"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 p-1 rounded-2xl"
      >
        <DropdownMenuLabel className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
          Viewing as
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 py-3 text-xs text-gray-500"
            >
              Loading shells…
            </motion.div>
          ) : shells.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 py-3 text-xs text-gray-500"
            >
              No shells available.
            </motion.div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {shells.map((s) => {
                const active = s._id === currentShell?._id;
                return (
                  <DropdownMenuItem
                    key={s._id}
                    onSelect={() => switchTo(s)}
                    className={`cursor-pointer px-3 py-2.5 rounded-xl ${
                      active ? "bg-red-50/70" : "hover:bg-gray-50"
                    }`}
                  >
                    <Building2
                      className={`w-4 h-4 ${
                        active ? "text-red-600" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm flex-1 truncate ${
                        active ? "font-extrabold text-gray-900" : "font-semibold text-gray-800"
                      }`}
                    >
                      {s.name}
                    </span>
                    {active && <Check className="w-4 h-4 text-red-600" />}
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
