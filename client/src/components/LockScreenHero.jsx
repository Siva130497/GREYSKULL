import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { api } from "../lib/api";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatTemp(t) {
  if (t == null) return "—";
  return `${Math.round(t)}°C`;
}

// Simple icon mapping (replace later with SVG pack if you want)
function weatherGlyph(codeOrText = "") {
  const s = String(codeOrText).toLowerCase();
  if (s.includes("snow")) return "❄️";
  if (s.includes("rain") || s.includes("drizzle")) return "🌧️";
  if (s.includes("storm") || s.includes("thunder")) return "⛈️";
  if (s.includes("cloud")) return "☁️";
  if (s.includes("fog") || s.includes("mist")) return "🌫️";
  return "🌤️";
}

export default function LockScreenHero({ shellId, shellName }) {
  const [now, setNow] = useState(dayjs());
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!shellId) return;
    api
      .get(`/weather?shellId=${shellId}`)
      .then((res) => setWeather(res.data?.data || null))
      .catch(() => setWeather(null));
  }, [shellId]);

  const timeStr = useMemo(() => `${pad2(now.hour())}:${pad2(now.minute())}`, [now]);
  const dateStr = useMemo(() => now.format("dddd, D MMMM YYYY"), [now]);

  const summary = weather?.summary || weather?.condition || "Cloudy";
  const temp = formatTemp(weather?.tempC ?? weather?.temp);
  const wind = weather?.windKph != null ? `Wind ${Math.round(weather.windKph)} km/h` : null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Animated wallpaper */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_20%,rgba(239,68,68,0.40),transparent_60%),radial-gradient(900px_circle_at_80%_20%,rgba(234,179,8,0.35),transparent_55%),radial-gradient(900px_circle_at_60%_80%,rgba(16,185,129,0.32),transparent_55%),linear-gradient(180deg,#0b1220, #0b1220)]" />
        {/* subtle blur glow */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        {/* floating blobs */}
        <motion.div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-2xl"
          animate={{ x: [0, 30, 0], y: [0, 18, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-10 right-[-120px] w-96 h-96 rounded-full bg-white/10 blur-2xl"
          animate={{ x: [0, -40, 0], y: [0, 25, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-140px] left-1/3 w-[520px] h-[520px] rounded-full bg-white/10 blur-2xl"
          animate={{ x: [0, 20, 0], y: [0, -25, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* light streak overlay */}
        <div className="absolute inset-0 opacity-30 mix-blend-screen bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.14)_30%,transparent_60%)]" />
      </div>

      {/* Top-left lockscreen cluster */}
      <div className="relative z-10 p-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex flex-col gap-2 rounded-3xl bg-white/14 border border-white/20 backdrop-blur-xl px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        >
          <div className="text-white/95 font-extrabold tracking-tight text-6xl md:text-7xl">
            {timeStr}
          </div>

          <div className="text-white/80 font-medium text-base">
            {dateStr}
          </div>

          <div className="mt-2 flex items-center gap-3 text-white/85">
            <div className="text-2xl">{weatherGlyph(summary)}</div>
            <div className="flex flex-col leading-tight">
              <div className="text-sm font-semibold">
                {summary} • {temp}
              </div>
              <div className="text-xs text-white/70">
                {shellName ? `Shell ${shellName}` : "Select a shell"}{wind ? ` • ${wind}` : ""}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Small top-right “cloud icon” */}
      <div className="absolute top-8 right-10 z-10 text-white/80 text-4xl">
        ☁️
      </div>
    </div>
  );
}