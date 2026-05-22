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
      className={`relative h-28 sm:h-36 md:h-44 lg:h-48 overflow-hidden bg-gradient-to-r ${theme.bg}`}
    >
      <LightStreaks />

      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/0 to-black/5" />

      <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 md:h-20 bg-black/5 rounded-t-[50px]" />

      <div className="relative z-10 h-full px-3 sm:px-5 md:px-6 flex items-center justify-between gap-3 sm:gap-5">
        <div
          className="
            rounded-2xl
            px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4
            backdrop-blur-md
            border border-white/30
            shadow-sm
            min-w-0
          "
          style={{ background: theme.glass }}
        >
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-black/65 leading-none truncate">
            {dayName}
          </div>

          <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm md:text-base font-medium text-black/60 truncate">
            {label ? label : "Loading weather..."}
            {typeof temp === "number" ? ` • ${Math.round(temp)}°C` : ""}
            <span className="hidden sm:inline">
              {typeof wind === "number" ? ` • Wind ${Math.round(wind)} km/h` : ""}
            </span>
          </div>
        </div>

        <div className="relative shrink-0">
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
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 drop-shadow-sm"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
