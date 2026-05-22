import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FIXED_COLORS = {
  Issues: "bg-red-600",
  "Site closers": "bg-indigo-600",
  "Call logs": "bg-amber-500",
  "Anything related to site and sales": "bg-emerald-600",
};

const FALLBACKS = [
  "bg-sky-600",
  "bg-fuchsia-600",
  "bg-teal-600",
  "bg-violet-600",
  "bg-lime-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-orange-600",
];

function hashStringToIndex(str, mod) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % mod;
}

function colorForIssueType(name = "") {
  const clean = String(name || "").trim();
  if (!clean) return "bg-gray-500";

  if (FIXED_COLORS[clean]) return FIXED_COLORS[clean];

  const fixedKey = Object.keys(FIXED_COLORS).find(
    (k) => k.toLowerCase() === clean.toLowerCase()
  );
  if (fixedKey) return FIXED_COLORS[fixedKey];

  const idx = hashStringToIndex(clean.toLowerCase(), FALLBACKS.length);
  return FALLBACKS[idx];
}

function fmtHourLabel(h) {
  return String(h).padStart(2, "0");
}

function safeHourFromTime(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const hour = Number(timeStr.split(":")?.[0]);
  return Number.isFinite(hour) ? hour : null;
}

function resolveIssueName(e) {
  return (
    e?.issueType?.name ||
    e?.issueTypeId?.name ||
    e?.issueTypeName ||
    "Other"
  );
}

function resolveStaffName(e) {
  return e?.staff?.name || e?.staffId?.name || e?.staffName || "";
}

export default function StationTimeline({
  entries = [],
  selectedDate,
  startHour = 0,
  endHour = 23,
}) {
  const scrollerRef = useRef(null);
  const rowRefs = useRef({});

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  function openEntry(e) {
    setActive(e);
    setOpen(true);
  }

  const hours = useMemo(() => {
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  }, [startHour, endHour]);

  const byHour = useMemo(() => {
    const map = new Map();
    hours.forEach((h) => map.set(h, []));

    for (const e of entries) {
      const hour = safeHourFromTime(e.time);
      if (hour != null && map.has(hour)) map.get(hour).push(e);
    }

    hours.forEach((h) => {
      const list = map.get(h) || [];
      list.sort((a, b) => String(a.time).localeCompare(String(b.time)));
    });

    return map;
  }, [entries, hours]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const isToday = selectedDate && dayjs(selectedDate).isSame(dayjs(), "day");
    const targetHour = isToday ? dayjs().hour() : 9;

    const el = rowRefs.current[targetHour];
    if (!el) return;

    const top = el.offsetTop;
    const elHeight = el.offsetHeight;
    const containerHeight = scroller.clientHeight;

    const nextScrollTop = top - containerHeight / 2 + elHeight / 2;

    scroller.scrollTo({
      top: Math.max(0, nextScrollTop),
      behavior: "smooth",
    });
  }, [selectedDate, hours]);

  const nowHour = dayjs().hour();
  const isToday = selectedDate && dayjs(selectedDate).isSame(dayjs(), "day");

  return (
    <>
      <div className="bg-white">
        <div ref={scrollerRef}>
          <div className="relative">
            {hours.map((h) => {
              const hourEntries = byHour.get(h) || [];
              const isNow = isToday && h === nowHour;

              return (
                <div
                  key={h}
                  ref={(node) => {
                    if (node) rowRefs.current[h] = node;
                  }}
                  className="border-b"
                >
                  <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[72px_1fr] md:grid-cols-[84px_1fr]">
                    {/* Time column */}
                    <div className="px-2 sm:px-3 py-3 sm:py-4 text-red-600 font-semibold text-xs sm:text-sm bg-white">
                      <div className="leading-none">{fmtHourLabel(h)}</div>
                      <div className="text-[10px] sm:text-xs font-normal text-red-600/90 mt-1">
                        00
                      </div>
                    </div>

                    {/* Entries column */}
                    <div className="py-2 sm:py-3 pr-2 sm:pr-3 md:pr-4">
                      {isNow && (
                        <div className="mb-2 h-[2px] w-full bg-red-500/40 rounded-full" />
                      )}

                      <div className="space-y-2 sm:space-y-3">
                        {hourEntries.length === 0 ? (
                          <div className="h-10 sm:h-12 rounded-xl bg-gray-50 border border-gray-100" />
                        ) : (
                          hourEntries.map((e) => {
                            const issueName = resolveIssueName(e);
                            const staffName = resolveStaffName(e);
                            const color = colorForIssueType(issueName);

                            return (
                              <button
                                key={e._id || `${e.time}-${e.description}`}
                                onClick={() => openEntry(e)}
                                className={`${color} w-full min-h-[3rem] sm:min-h-[3rem] rounded-xl shadow-sm text-white text-left
                                  active:scale-[0.99] transition
                                  focus:outline-none
                                  px-3 sm:px-4 py-2 sm:py-2.5`}
                                title={staffName ? `By ${staffName}` : ""}
                              >
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <span className="font-semibold text-xs sm:text-sm tabular-nums shrink-0">
                                    {e.time}
                                  </span>
                                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-white/20 text-[10px] sm:text-xs font-bold truncate max-w-[40%] sm:max-w-none">
                                    {issueName}
                                  </span>
                                  {staffName && (
                                    <span className="ml-auto text-[10px] sm:text-xs bg-white/15 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shrink-0 hidden xs:inline-flex">
                                      {staffName}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs sm:text-sm mt-1 line-clamp-2">
                                  {e.description || ""}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="w-[min(96vw,520px)] max-w-[520px] rounded-2xl p-5 sm:p-6"
        >
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Station Entry</DialogTitle>
          </DialogHeader>

          {active && (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-[80px_1fr] gap-2 items-baseline">
                <div className="text-xs sm:text-sm font-semibold text-gray-700">Time</div>
                <div className="text-sm text-gray-900 tabular-nums">{active.time}</div>
              </div>

              <div className="grid grid-cols-[80px_1fr] gap-2 items-baseline">
                <div className="text-xs sm:text-sm font-semibold text-gray-700">Category</div>
                <div className="text-sm text-gray-900">{resolveIssueName(active)}</div>
              </div>

              <div className="grid grid-cols-[80px_1fr] gap-2 items-baseline">
                <div className="text-xs sm:text-sm font-semibold text-gray-700">Staff</div>
                <div className="text-sm text-gray-900">{resolveStaffName(active) || "—"}</div>
              </div>

              <div>
                <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Description
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 sm:p-4 text-sm text-gray-900 whitespace-pre-wrap break-words">
                  {active.description || ""}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
