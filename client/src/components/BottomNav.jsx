import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { NotebookPen, Coffee, Package, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "../lib/api";
import { getSession } from "../lib/storage";
import { STOCK_UPDATED_EVENT } from "../lib/events";

const tabs = [
  {
    label: "Station Diary",
    to: "/app/diary",
    Icon: NotebookPen,
    activeBg: "bg-yellow-400",
    activeText: "text-gray-900",
    inactiveBg: "bg-gray-100",
    inactiveText: "text-gray-600",
  },
  {
    label: "Costa Guide",
    to: "/app/costa",
    Icon: Coffee,
    activeBg: "bg-red-600",
    activeText: "text-white",
    inactiveBg: "bg-gray-100",
    inactiveText: "text-gray-600",
  },
  {
    label: "Stock List",
    to: "/app/stock",
    Icon: Package,
    activeBg: "bg-blue-600",
    activeText: "text-white",
    inactiveBg: "bg-gray-100",
    inactiveText: "text-gray-600",
    disabled: true, // you said later
  },
  {
    label: "More",
    to: "/app/more",
    Icon: MoreHorizontal,
    activeBg: "bg-emerald-600",
    activeText: "text-white",
    inactiveBg: "bg-gray-100",
    inactiveText: "text-gray-600",
    disabled: true, // you said later
  },
];

function TabButton({ tab, outCount }) {
  // ✅ Keep your existing "disabled" behavior, but allow Stock tab when route is used
  const allowStock = tab.label === "Stock List"; // stock is now live
  const isDisabled = tab.disabled && !allowStock;

  if (isDisabled) {
    return (
      <div className="h-12 md:h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center gap-2 border border-gray-100">
        <tab.Icon className="w-5 h-5" />
        <span className="text-sm md:text-base font-semibold">{tab.label}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={tab.to}
      className={({ isActive }) =>
        [
          "relative h-12 md:h-14 rounded-2xl",
          "flex items-center justify-center gap-2",
          "transition overflow-hidden",
          isActive
            ? `${tab.activeBg} ${tab.activeText} shadow-sm`
            : `${tab.inactiveBg} ${tab.inactiveText} hover:bg-gray-200`,
        ].join(" ")
      }
      end
    >
      {({ isActive }) => (
        <>
          {/* Active shine / movement */}
          {isActive && (
            <motion.div
              layoutId="navShine"
              className="absolute inset-0 opacity-20 bg-gradient-to-r from-white/0 via-white/60 to-white/0"
              initial={false}
              animate={{ x: ["-30%", "130%"] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* ✅ Stock badge */}
          {tab.label === "Stock List" && outCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-extrabold flex items-center justify-center z-20">
              {outCount}
            </span>
          )}

          <tab.Icon className="w-5 h-5 relative z-10" />
          <span className="text-sm md:text-base font-semibold relative z-10">
            {tab.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function TabBar() {
  const location = useLocation();
  const { shell } = getSession() || {};
  const [outCount, setOutCount] = useState(0);

  async function refreshCount() {
    try {
      if (!shell?._id) return;
      const res = await api.get(`/stock?shellId=${shell._id}`);
      setOutCount(res.data?.data?.outCount || 0);
    } catch {
      // keep calm, no UI crash
    }
  }

  useEffect(() => {
    refreshCount();
  }, [shell?._id]);

  // refresh when route changes (keeps badge accurate)
  useEffect(() => {
    refreshCount();
  }, [location.pathname]);

  // refresh when stock changes anywhere
  useEffect(() => {
    const handler = () => refreshCount();
    window.addEventListener(STOCK_UPDATED_EVENT, handler);
    return () => window.removeEventListener(STOCK_UPDATED_EVENT, handler);
  }, []);

  return (
    <div className="sticky bottom-0 z-50 bg-white border-t">
      <div className="px-3 py-2">
        <div className="grid grid-cols-4 gap-2">
          {tabs.map((t) => (
            <TabButton key={t.label} tab={t} outCount={outCount} />
          ))}
        </div>

        {/* iPad safe area spacing */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}