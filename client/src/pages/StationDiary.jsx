import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { api } from "../lib/api";
import { getUser, getShell, setActiveShell } from "../lib/storage";

import StationTopBar from "../components/StationTopBar";
import StationTimeline from "../components/StationTimeline";
import WeatherBanner from "../components/WeatherBanner";
import WeekBar from "../components/WeekBar";
import AddIssueDrawer from "../components/AddIssueDrawer";

export default function StationDiary() {
  const user = getUser();
  const isAdmin = user?.role === "super_admin";

  // Local state tracks the active shell so the ShellSwitcher can update us
  // without a page reload.
  const [shell, setShell] = useState(getShell());

  // For super_admin landing here with no shell picked yet, fall back to the
  // first shell automatically so the page isn't broken.
  useEffect(() => {
    if (shell || !isAdmin) return;
    api
      .get("/shells")
      .then((res) => {
        const first = res.data?.data?.[0];
        if (!first) return;
        setActiveShell(first);
        setShell(first);
      })
      .catch(() => {});
  }, [shell, isAdmin]);

  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [entries, setEntries] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [weather, setWeather] = useState(null);
  const [direction, setDirection] = useState(1);

  const monthLabel = useMemo(() => dayjs(date).format("MMMM YYYY"), [date]);
  const timeLabel = useMemo(() => dayjs().format("HH:mm"), []);

  function changeDate(next) {
    const curr = dayjs(date);
    const nxt = dayjs(next);
    setDirection(nxt.isAfter(curr) ? 1 : -1);
    setDate(next);
  }

  function changeShell(next) {
    setShell(next);
  }

  useEffect(() => {
    if (!shell?._id) return;
    api
      .get(`/weather?shellId=${shell._id}`)
      .then((res) => setWeather(res.data.data))
      .catch(() => setWeather(null));
  }, [shell?._id, date]);

  useEffect(() => {
    if (!shell?._id) {
      setIssueTypes([]);
      return;
    }
    api
      .get(`/issue-types?shellId=${shell._id}`)
      .then((res) => setIssueTypes(res.data.data || []))
      .catch(() => setIssueTypes([]));
  }, [shell?._id]);

  useEffect(() => {
    if (!shell?._id) {
      setEntries([]);
      return;
    }
    api
      .get(`/diary?shellId=${shell._id}&date=${date}`)
      .then((res) => setEntries(res.data.data || []))
      .catch(() => setEntries([]));
  }, [shell?._id, date]);

  async function addEntry(issueTypeId, description) {
    if (!shell?._id) return;
    // Super admin doesn't have a per-shell staff record; use their own _id
    await api.post("/diary", {
      shellId: shell._id,
      staffId: user._id,
      issueTypeId,
      date,
      time: dayjs().format("HH:mm"),
      description,
    });

    const refreshed = await api.get(`/diary?shellId=${shell._id}&date=${date}`);
    setEntries(refreshed.data.data || []);
  }

  return (
    // Full-height column so we can own the scrolling: header is shrink-0,
    // timeline is flex-1 + overflow-y-auto. The outer <main> already provides
    // bottom padding for the nav, so we don't add it again here.
    <div className="h-full flex flex-col bg-shellbg">
      <div className="shrink-0 z-40 bg-white">
        <StationTopBar
          shellName={shell ? `Shell ${shell.name} Station` : "Pick a shell"}
          monthLabel={monthLabel}
          timeLabel={timeLabel}
          selectedDate={date}
          onDateChange={changeDate}
          onShellChange={changeShell}
        />

        <WeekBar selectedDate={date} onChange={changeDate} direction={direction} />

        <div className="border-b">
          <WeatherBanner dayName={dayjs(date).format("dddd")} weather={weather} />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-white">
        {shell?._id ? (
          <StationTimeline
            entries={entries}
            selectedDate={date}
            startHour={0}
            endHour={23}
          />
        ) : (
          <div className="p-6 text-center text-sm text-gray-500">
            Pick a shell from the top to view the diary.
          </div>
        )}
      </div>

      <div
        className="
          pointer-events-none
          fixed right-4 sm:right-6
          z-40
        "
        style={{
          bottom: "calc(80px + env(safe-area-inset-bottom) + 16px)",
        }}
      >
        <div className="pointer-events-auto">
          {shell?._id && (
            <AddIssueDrawer issueTypes={issueTypes} onSubmit={addEntry} />
          )}
        </div>
      </div>
    </div>
  );
}
