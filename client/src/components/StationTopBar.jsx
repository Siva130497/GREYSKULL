import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import "../styles/globals.css";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function IconBtn({ children, onClick, title }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm active:scale-95 transition"
    >
      {children}
    </button>
  );
}

export default function StationTopBar({
  shellName,
  monthLabel,
  timeLabel,
  selectedDate,
  onDateChange,
  onBellClick,
  onTimerClick,
}) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => {
    return selectedDate ? dayjs(selectedDate).toDate() : new Date();
  }, [selectedDate]);

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="bg-white border-b"
    >
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Left: Month dropdown + Time */}
        <div className="flex flex-col leading-tight">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                className="
    text-red-600 font-bold text-sm
    inline-flex items-center gap-1
    px-2 py-1 rounded-lg
    hover:bg-red-50 active:bg-red-100
    transition
  "
              >
                {monthLabel} <span className="text-red-600">▾</span>
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              side="bottom"
              sideOffset={10}
              className="
    w-[360px] md:w-[420px]
    p-0
    rounded-2xl
    shadow-2xl
    border border-white/30
    bg-white/85
    backdrop-blur-xl
    overflow-hidden
  "
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-black/5">
                <div className="text-lg font-semibold text-gray-900">
                  Select a date
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Tap a day to jump instantly
                </div>
              </div>

              {/* Calendar wrapper with spacing fixes */}
              <div className="px-4 py-3 calendar-popover">
                {/* Calendar wrapper with proper card */}
<div className="px-5 py-4">
  <div className="mx-auto w-fit rounded-2xl bg-white shadow-sm border border-black/5 p-3">
    <Calendar
      mode="single"
      selected={selected}
      onSelect={(d) => {
        if (!d) return;
        onDateChange(dayjs(d).format("YYYY-MM-DD"));
        setOpen(false);
      }}
      initialFocus
    />
  </div>

  <div className="mt-4 flex justify-end">
    <button
      onClick={() => {
        onDateChange(dayjs().format("YYYY-MM-DD"));
        setOpen(false);
      }}
      className="
        px-6 py-3 rounded-2xl
        bg-red-600 text-white font-semibold
        shadow-sm active:scale-95 transition
      "
    >
      Today
    </button>
  </div>
</div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="text-gray-400 text-xs">{timeLabel}</div>
        </div>

        {/* Center: Shell name */}
        <div className="text-gray-500 font-semibold text-sm md:text-base truncate max-w-[55%] text-center">
          {shellName}
        </div>

        {/* Right: action buttons */}
        <div className="flex gap-2">
          <IconBtn title="Calendar" onClick={() => setOpen(true)}>
            📅
          </IconBtn>
          <IconBtn title="Notifications" onClick={onBellClick}>
            🔔
          </IconBtn>
          <IconBtn title="Tools" onClick={onTimerClick}>
            ⏱️
          </IconBtn>
        </div>
      </div>
    </motion.div>
  );
}
