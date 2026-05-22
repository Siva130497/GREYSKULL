import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  NotebookPen,
  Coffee,
  Wrench,
  Package,
  DoorOpen,
  LayoutGrid,
  Salad,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "../lib/api";
import { getShell, getUser } from "../lib/storage";
import { STOCK_UPDATED_EVENT } from "../lib/events";

function buildTabs(isAdmin) {
  const base = [
    {
      key: "diary",
      label: "Diary",
      fullLabel: "Station Diary",
      to: "/app/diary",
      Icon: NotebookPen,
      activeBg: "bg-yellow-400",
      activeText: "text-gray-900",
    },
    {
      key: "costa",
      label: "Costa",
      fullLabel: "Costa Guide",
      to: "/app/costa",
      Icon: Coffee,
      activeBg: "bg-red-600",
      activeText: "text-white",
    },
    {
      key: "faults",
      label: "Faults",
      fullLabel: "Costa Faults",
      to: "/app/faults",
      Icon: Wrench,
      activeBg: "bg-[#6f1d3a]",
      activeText: "text-white",
    },
    {
      key: "stock",
      label: "Stock",
      fullLabel: "Stock List",
      to: "/app/stock",
      Icon: Package,
      activeBg: "bg-blue-600",
      activeText: "text-white",
    },
    {
      key: "trading",
      label: "Trade",
      fullLabel: "Open & Trade",
      to: "/app/trading",
      Icon: DoorOpen,
      activeBg: "bg-emerald-600",
      activeText: "text-white",
    },
    {
      key: "planogram",
      label: "Plan",
      fullLabel: "Planogram",
      to: "/app/planogram",
      Icon: LayoutGrid,
      activeBg: "bg-violet-600",
      activeText: "text-white",
    },
    {
      key: "food",
      label: "Food",
      fullLabel: "Food Safety",
      to: "/app/food",
      Icon: Salad,
      activeBg: "bg-lime-600",
      activeText: "text-white",
      disabled: true,
    },
  ];

  if (isAdmin) {
    base.push({
      key: "admin",
      label: "Admin",
      fullLabel: "Admin",
      to: "/app/admin",
      Icon: ShieldCheck,
      activeBg: "bg-amber-500",
      activeText: "text-white",
    });
  } else {
    base.push({
      key: "more",
      label: "More",
      fullLabel: "More",
      to: "/app/more",
      Icon: MoreHorizontal,
      activeBg: "bg-emerald-600",
      activeText: "text-white",
      disabled: true,
    });
  }

  return base;
}

function TabButton({ tab, outCount }) {
  if (tab.disabled) {
    return (
      <div className="h-14 sm:h-14 md:h-16 rounded-2xl bg-gray-50 text-gray-400 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 border border-gray-100 px-1">
        <tab.Icon className="w-5 h-5 shrink-0" />
        <span className="font-semibold leading-tight">
          <span className="lg:hidden text-[10px] sm:text-xs md:text-sm">
            {tab.label}
          </span>
          <span className="hidden lg:inline text-xs xl:text-sm">
            {tab.fullLabel}
          </span>
        </span>
      </div>
    );
  }

  return (
    <NavLink
      to={tab.to}
      className={({ isActive }) =>
        [
          "relative h-14 sm:h-14 md:h-16 rounded-2xl",
          "flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5",
          "transition overflow-hidden px-1 sm:px-1.5 md:px-2",
          isActive
            ? `${tab.activeBg} ${tab.activeText} shadow-sm`
            : "bg-gray-100 text-gray-600 hover:bg-gray-200",
        ].join(" ")
      }
      end
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="navShine"
              className="absolute inset-0 opacity-20 bg-gradient-to-r from-white/0 via-white/60 to-white/0"
              initial={false}
              animate={{ x: ["-30%", "130%"] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: "linear" }}
            />
          )}

          {tab.key === "stock" && outCount > 0 && (
            <span className="absolute top-1 right-1 sm:-top-2 sm:-right-2 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-5 px-1 rounded-full bg-red-600 text-white text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center z-20 ring-2 ring-white">
              {outCount}
            </span>
          )}

          <tab.Icon className="w-5 h-5 relative z-10 shrink-0" />
          <span className="font-semibold leading-tight relative z-10">
            <span className="lg:hidden text-[10px] sm:text-xs md:text-sm">
              {tab.label}
            </span>
            <span className="hidden lg:inline text-xs xl:text-sm">
              {tab.fullLabel}
            </span>
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  const location = useLocation();
  const shell = getShell();
  const user = getUser();
  const isAdmin = user?.role === "super_admin";

  const [outCount, setOutCount] = useState(0);
  const tabs = buildTabs(isAdmin);

  async function refreshCount() {
    try {
      if (!shell?._id) {
        setOutCount(0);
        return;
      }
      const res = await api.get(`/stock?shellId=${shell._id}`);
      setOutCount(res.data?.data?.outCount || 0);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    refreshCount();
  }, [shell?._id]);

  useEffect(() => {
    refreshCount();
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => refreshCount();
    window.addEventListener(STOCK_UPDATED_EVENT, handler);
    return () => window.removeEventListener(STOCK_UPDATED_EVENT, handler);
  }, []);

  return (
    <div className="bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="px-1 sm:px-2 lg:px-3 py-2 max-w-7xl mx-auto">
        <div className="grid grid-cols-8 gap-0.5 sm:gap-1 lg:gap-1.5">
          {tabs.map((t) => (
            <TabButton key={t.key} tab={t} outCount={outCount} />
          ))}
        </div>
      </div>
    </div>
  );
}
