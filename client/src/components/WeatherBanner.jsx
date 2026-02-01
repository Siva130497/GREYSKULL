import { motion } from "framer-motion";
import { WeatherIcon } from "./weather/WeatherIcons";

const THEMES = {
  clear: {
    bg: "from-sky-400 via-sky-300 to-amber-100",
    glass: "rgba(255,255,255,0.30)",
    glow: "rgba(255,215,0,0.35)",
  },
  cloudy: {
    bg: "from-slate-500 via-slate-300 to-slate-100",
    glass: "rgba(255,255,255,0.28)",
    glow: "rgba(255,255,255,0.20)",
  },
  rain: {
    bg: "from-blue-800 via-blue-600 to-sky-200",
    glass: "rgba(255,255,255,0.22)",
    glow: "rgba(120,200,255,0.25)",
  },
  snow: {
    bg: "from-cyan-300 via-slate-200 to-white",
    glass: "rgba(255,255,255,0.32)",
    glow: "rgba(255,255,255,0.35)",
  },
  fog: {
    bg: "from-gray-600 via-gray-300 to-gray-100",
    glass: "rgba(255,255,255,0.22)",
    glow: "rgba(255,255,255,0.18)",
  },
  storm: {
    bg: "from-indigo-950 via-indigo-700 to-slate-300",
    glass: "rgba(255,255,255,0.18)",
    glow: "rgba(130,130,255,0.25)",
  },
};

// Ambient layers (reuse your existing animated layers if you already added them)
// If you already have AmbientLayer from the previous message, keep it.
// For simplicity, we keep the banner visuals plus streaks and icons.
// (If you want, I’ll merge everything in one file next.)

function LightStreaks() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-12 -left-20 w-[140%] h-40 rotate-[-12deg] opacity-20 bg-gradient-to-r from-white/0 via-white/50 to-white/0 blur-2xl" />
      <div className="absolute top-8 -right-24 w-[140%] h-32 rotate-[10deg] opacity-15 bg-gradient-to-r from-white/0 via-white/40 to-white/0 blur-2xl" />
    </div>
  );
}

export default function WeatherBanner({ dayName, weather }) {
  const themeKey = weather?.current?.theme || "cloudy";
  const theme = THEMES[themeKey] || THEMES.cloudy;

  const label = weather?.current?.label;
  const temp = weather?.current?.tempC;
  const wind = weather?.current?.windKmh;

  return (
    <motion.div
      key={themeKey}
      initial={{ opacity: 0.85, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`relative h-40 md:h-48 overflow-hidden bg-gradient-to-r ${theme.bg}`}
    >
      {/* Light streak overlay (premium sheen) */}
      <LightStreaks />

      {/* Soft haze */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/0 to-black/5" />

      {/* Horizon curve */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/5 rounded-t-[50px]" />

      {/* Content */}
      <div className="relative z-10 h-full px-6 flex items-center justify-between gap-6">
        {/* Glass info */}
        <div
          className="rounded-2xl px-5 py-4 backdrop-blur-md border border-white/30 shadow-sm"
          style={{ background: theme.glass }}
        >
          <div className="text-4xl md:text-5xl font-semibold text-black/65 leading-none">
            {dayName}
          </div>

          <div className="mt-2 text-sm md:text-base font-medium text-black/60">
            {label ? label : "Loading weather..."}
            {typeof temp === "number" ? ` • ${Math.round(temp)}°C` : ""}
            {typeof wind === "number" ? ` • Wind ${Math.round(wind)} km/h` : ""}
          </div>
        </div>

        {/* SVG Icon with glow + float */}
        <div className="relative">
          <div
            className="absolute inset-0 blur-2xl rounded-full"
            style={{ background: theme.glow }}
          />
          <motion.div
            initial={{ y: 6 }}
            animate={{ y: -6 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 2.6,
              ease: "easeInOut",
            }}
            className="relative"
          >
            <WeatherIcon
              theme={themeKey}
              className="w-20 h-20 md:w-24 md:h-24 drop-shadow-sm"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}