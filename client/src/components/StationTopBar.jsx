import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Bell } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ProfileMenu from "./ProfileMenu";
import ShellSwitcher from "./ShellSwitcher";

function IconBtn({ children, onClick, title }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="
        w-10 h-10 sm:w-11 sm:h-11
        rounded-full
        bg-red-600 hover:bg-red-700
        text-white
        flex items-center justify-center
        shadow-sm
        active:scale-95 transition
      "
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
  onShellChange,
}) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => {
    return selectedDate ? dayjs(selectedDate).toDate() : new Date();
  }, [selectedDate]);

  return (
    <motion.div
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="bg-white border-b"
    >
      <div className="h-14 sm:h-16 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Month dropdown + Time */}
        <div className="flex flex-col leading-tight min-w-0">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                className="
                  text-red-600 font-bold text-sm sm:text-base
                  inline-flex items-center gap-1
                  px-2 py-1 rounded-lg
                  hover:bg-red-50 active:bg-red-100
                  transition
                  max-w-[140px] sm:max-w-none truncate
                "
              >
                <span className="truncate">{monthLabel}</span>
                <span className="text-red-600 shrink-0">▾</span>
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              side="bottom"
              sideOffset={10}
              className="
                w-[min(92vw,360px)] sm:w-[420px]
                p-0
                rounded-2xl
                shadow-2xl
                border border-white/30
                bg-white/95
                backdrop-blur-xl
                overflow-hidden
              "
            >
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-black/5">
                <div className="text-base sm:text-lg font-semibold text-gray-900">
                  Select a date
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Tap a day to jump instantly
                </div>
              </div>

              <div className="px-3 sm:px-5 py-3 sm:py-4">
                <div className="mx-auto w-fit rounded-2xl bg-white shadow-sm border border-black/5 p-2 sm:p-3">
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

                <div className="mt-3 sm:mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      onDateChange(dayjs().format("YYYY-MM-DD"));
                      setOpen(false);
                    }}
                    className="
                      px-5 sm:px-6 py-2.5 sm:py-3
                      rounded-2xl
                      bg-red-600 text-white font-semibold text-sm sm:text-base
                      shadow-sm active:scale-95 transition
                    "
                  >
                    Today
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="text-gray-400 text-[11px] sm:text-xs tabular-nums">
            {timeLabel}
          </div>
        </div>

        {/* Center: Shell switcher (admin) or shell name (others) */}
        <div className="hidden sm:flex flex-1 items-center justify-center min-w-0 px-2">
          <ShellSwitcher tone="muted" onChange={onShellChange} />
        </div>

        {/* Right: action buttons + profile */}
        <div className="flex gap-1.5 sm:gap-2 shrink-0 items-center">
          <IconBtn title="Calendar" onClick={() => setOpen(true)}>
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </IconBtn>
          <IconBtn title="Notifications" onClick={onBellClick}>
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </IconBtn>
          <ProfileMenu />
        </div>
      </div>

      {/* Compact shell switcher shown on phones below the bar */}
      <div className="sm:hidden px-3 pb-2 -mt-1">
        <ShellSwitcher tone="muted" onChange={onShellChange} />
      </div>
    </motion.div>
  );
}
