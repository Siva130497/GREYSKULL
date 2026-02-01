import dayjs from "dayjs";
import { motion } from "framer-motion";
import { useMemo } from "react";

function DayCell({ day, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative flex-1 h-14 md:h-16 px-2 focus:outline-none"
    >
      {/* Only ONE shared pill in the whole bar */}
      {isSelected && (
        <motion.div
          layoutId="activeDayPill"
          className="absolute inset-1 rounded-2xl bg-yellow-400 shadow-sm"
          transition={{ type: "spring", stiffness: 520, damping: 34 }}
        />
      )}

      <div className="relative z-10 h-full flex flex-col items-center justify-center leading-tight">
        <div className={`text-xs md:text-sm font-semibold ${isSelected ? "text-gray-900" : "text-red-600"}`}>
          {day.format("ddd")}
        </div>
        <div className={`text-sm md:text-base font-semibold ${isSelected ? "text-gray-900" : "text-gray-500"}`}>
          {day.format("D")}
        </div>
      </div>
    </button>
  );
}

export default function WeekBar({ selectedDate, onChange, direction = 1 }) {
  const days = useMemo(() => {
    const selected = dayjs(selectedDate);
    const start = selected.subtract(3, "day"); // selected stays center
    return Array.from({ length: 7 }).map((_, i) => start.add(i, "day"));
  }, [selectedDate]);

  return (
    <div className="bg-white border-b">
      <div className="px-3 py-3">
        <div className="flex items-center gap-3">
          {/* Left Arrow */}
          <button
            onClick={() =>
              onChange(dayjs(selectedDate).subtract(1, "day").format("YYYY-MM-DD"))
            }
            className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm active:scale-95 transition"
          >
            ‹
          </button>

          {/* Week Bar */}
          <div className="flex-1 overflow-hidden">
            <div className="bg-gray-100 rounded-2xl p-1">
              {/* Small “nudge” animation for the row without duplicating DOM */}
              <motion.div
                key={selectedDate} // OK now because we're not using AnimatePresence
                initial={{ x: direction > 0 ? 10 : -10, opacity: 0.9 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="flex"
              >
                {days.map((d) => {
                  const isSelected = d.format("YYYY-MM-DD") === selectedDate;
                  return (
                    <DayCell
                      key={d.format("YYYY-MM-DD")}
                      day={d}
                      isSelected={isSelected}
                      onClick={() => onChange(d.format("YYYY-MM-DD"))}
                    />
                  );
                })}
              </motion.div>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={() =>
              onChange(dayjs(selectedDate).add(1, "day").format("YYYY-MM-DD"))
            }
            className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm active:scale-95 transition"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}