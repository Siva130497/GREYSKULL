import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  NotebookPen,
  Coffee,
  Package,
  MoreHorizontal,
} from "lucide-react";

const tabs = [
  {
    label: "Station Diary",
    to: "/station-diary",
    Icon: NotebookPen,
    activeBg: "bg-yellow-400",
    activeText: "text-gray-900",
    chip: "bg-yellow-100 text-yellow-900",
  },
  {
    label: "Costa Guide",
    to: "/costa-guide",
    Icon: Coffee,
    activeBg: "bg-red-500",
    activeText: "text-white",
    chip: "bg-red-50 text-red-700",
  },
  {
    label: "Stock List",
    to: "/stock-list",
    Icon: Package,
    activeBg: "bg-blue-600",
    activeText: "text-white",
    chip: "bg-blue-50 text-blue-700",
  },
  {
    label: "More",
    to: "/more",
    Icon: MoreHorizontal,
    activeBg: "bg-emerald-600",
    activeText: "text-white",
    chip: "bg-emerald-50 text-emerald-700",
  },
];

export default function TabBar() {
  return (
    <div className="sticky top-0 z-40 bg-white border-b">
      <div className="px-3 py-2">
        <div className="grid grid-cols-4 gap-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                [
                  "relative h-12 md:h-14 rounded-2xl",
                  "flex items-center justify-center gap-2",
                  "transition overflow-hidden",
                  isActive ? `${t.activeBg} ${t.activeText} shadow-sm` : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active animated shine */}
                  {isActive && (
                    <motion.div
                      layoutId="tabShine"
                      className="absolute inset-0 opacity-20 bg-gradient-to-r from-white/0 via-white/60 to-white/0"
                      initial={false}
                      animate={{ x: ["-30%", "130%"] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                    />
                  )}

                  <t.Icon className="w-5 h-5 relative z-10" />
                  <span className="text-sm md:text-base font-semibold relative z-10">
                    {t.label}
                  </span>

                  {/* little badge style for non-active */}
                  {!isActive && (
                    <span className={`absolute right-2 top-2 text-[10px] px-2 py-0.5 rounded-full ${t.chip}`}>
                      {/* you can replace later with counts */}
                      •
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}