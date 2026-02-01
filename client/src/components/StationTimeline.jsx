import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Fixed colors for your main categories
 */
const FIXED_COLORS = {
  "Issues": "bg-red-600",
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
    e?.issueTypeId?.name || // if backend populates issueTypeId
    e?.issueTypeName ||     // if backend sends flat name
    "Other"
  );
}

function resolveStaffName(e) {
  return (
    e?.staff?.name ||
    e?.staffId?.name ||     // if backend populates staffId
    e?.staffName ||
    ""
  );
}

export default function StationTimeline({
  entries = [],
  selectedDate, // YYYY-MM-DD
  startHour = 0,
  endHour = 23,
}) {
  const scrollerRef = useRef(null);
  const rowRefs = useRef({}); // hour => element

  // ✅ popup state (MUST be inside component)
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

    // sort each hour by time
    hours.forEach((h) => {
      const list = map.get(h) || [];
      list.sort((a, b) => String(a.time).localeCompare(String(b.time)));
    });

    return map;
  }, [entries, hours]);

  // ✅ auto-center current hour (or 9am for not-today)
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
      <div className="flex-1 min-h-0 bg-white overflow-hidden">
        {/* ONLY THIS SCROLLS */}
        <div ref={scrollerRef} className="h-full overflow-y-auto">
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
                  <div className="grid grid-cols-[84px_1fr]">
                    {/* Left time column */}
                    <div className="px-3 py-4 text-red-600 font-semibold text-sm bg-white sticky left-0">
                      <div className="leading-none">{fmtHourLabel(h)}</div>
                      <div className="text-xs font-normal text-red-600/90 mt-1">
                        00
                      </div>
                    </div>

                    {/* Right cell */}
                    <div className="py-3 pr-4">
                      {/* current hour highlight line */}
                      {isNow && (
                        <div className="mb-2 h-[2px] w-full bg-red-500/40 rounded-full" />
                      )}

                      <div className="space-y-3">
                        {hourEntries.length === 0 ? (
                          <div className="h-12 rounded-xl bg-gray-50 border border-gray-100" />
                        ) : (
                          hourEntries.map((e) => {
                            const issueName = resolveIssueName(e);
                            const staffName = resolveStaffName(e);
                            const color = colorForIssueType(issueName);

                            return (
                              <button
                                key={e._id || `${e.time}-${e.description}`}
                                onClick={() => openEntry(e)}
                                className={`${color} w-full h-12 rounded-xl shadow-sm flex items-center px-4 text-white text-sm text-left
                                  active:scale-[0.99] transition
                                  focus:outline-none`}
                                title={staffName ? `By ${staffName}` : ""}
                              >
                                <span className="font-semibold mr-3">{e.time}</span>

                                <span className="px-2 py-1 rounded-lg bg-white/20 text-xs font-bold mr-3">
                                  {issueName}
                                </span>

                                <span className="truncate">{e.description || ""}</span>

                                {staffName && (
                                  <span className="ml-auto text-xs bg-white/15 px-2 py-1 rounded-lg">
                                    {staffName}
                                  </span>
                                )}
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

            {/* bottom fade */}
            <div className="pointer-events-none sticky bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
          </div>
        </div>
      </div>

      {/* ✅ Popup dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[520px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Station Entry</DialogTitle>
          </DialogHeader>

          {active && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-700">Time:</div>
                <div className="text-sm text-gray-900">{active.time}</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-700">Category:</div>
                <div className="text-sm text-gray-900">
                  {resolveIssueName(active)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-700">Staff:</div>
                <div className="text-sm text-gray-900">
                  {resolveStaffName(active) || "—"}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  Description
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-900 whitespace-pre-wrap">
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