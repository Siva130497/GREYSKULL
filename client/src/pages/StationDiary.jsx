import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { api } from "../lib/api";
import { getSession } from "../lib/storage";

import StationTopBar from "../components/StationTopBar";
import DateCarousel from "../components/DateCarousel";
import DayBanner from "../components/DayBanner";
import StationTimeline from "../components/StationTimeline";
import WeatherBanner from "../components/WeatherBanner";

// OPTIONAL: your existing AddIssueDrawer (keep it if you already have it)
import AddIssueDrawer from "../components/AddIssueDrawer";
import WeekBar from "../components/WeekBar";


export default function StationDiary() {
  const { shell, staff } = getSession();

  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [entries, setEntries] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);

  const monthLabel = useMemo(() => dayjs(date).format("MMMM YYYY"), [date]);
  const timeLabel = useMemo(() => dayjs().format("HH:mm"), []);

  const [weather, setWeather] = useState(null);

  const [direction, setDirection] = useState(1);

  function changeDate(next) {
  const curr = dayjs(date);
  const nxt = dayjs(next);
  setDirection(nxt.isAfter(curr) ? 1 : -1);
  setDate(next);
}

useEffect(() => {
  api.get(`/weather?shellId=${shell._id}`)
    .then(res => setWeather(res.data.data))
    .catch(() => setWeather(null));
}, [shell._id, date]);

  useEffect(() => {
    // issue types for dropdown
    api.get(`/issue-types?shellId=${shell._id}`).then((res) => setIssueTypes(res.data.data || []));
  }, [shell._id]);

  // useEffect(() => {
  //   api.get(`/diary?shellId=${shell._id}&date=${date}`).then((res) => setEntries(res.data.data || []));
  // }, [shell._id, date]);

  useEffect(() => {
  api.get(`/diary?shellId=${shell._id}&date=${date}`).then((res) => {
    console.log("sample diary item:", res.data.data?.[0]);
    setEntries(res.data.data || []);
  });
}, [shell._id, date]);

  async function addEntry(issueTypeId, description) {
    await api.post("/diary", {
      shellId: shell._id,
      staffId: staff._id,
      issueTypeId,
      date,
      time: dayjs().format("HH:mm"),
      description,
    });

    const refreshed = await api.get(`/diary?shellId=${shell._id}&date=${date}`);
    setEntries(refreshed.data.data || []);
  }

  return (
  <div className="h-full flex flex-col bg-shellbg">
    {/* This is the scroll container */}
    <div className="flex-1 min-h-0 overflow-y-auto">
      {/* Sticky stack */}
      <div className="sticky top-0 z-40 bg-white">
        <StationTopBar
          shellName={`Shell ${shell.name} Station`}
          monthLabel={monthLabel}
          timeLabel={timeLabel}
          selectedDate={date}
          onDateChange={changeDate}
          onBellClick={() => console.log("notifications")}
          onTimerClick={() => console.log("tools")}
        />

        <WeekBar selectedDate={date} onChange={changeDate} direction={direction} />

        {/* Weather banner: keep it sticky too */}
        <div className="border-b">
          <WeatherBanner dayName={dayjs(date).format("dddd")} weather={weather} />
        </div>
      </div>

      {/* Timeline scrolls under the sticky header */}
      <StationTimeline entries={entries} selectedDate={date} startHour={0} endHour={23} />

      {/* Add button can be fixed in viewport */}
 <div
  className="
    pointer-events-none
    fixed
    right-6
    z-50
    pb-[env(safe-area-inset-bottom)]
  "
  style={{ bottom: "96px" }} // 80px tab bar + 16px gap
>
  <div className="pointer-events-auto">
    <AddIssueDrawer issueTypes={issueTypes} onSubmit={addEntry} />
  </div>
</div>
    </div>
  </div>
);
}