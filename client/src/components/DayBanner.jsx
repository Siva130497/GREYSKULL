import { motion } from "framer-motion";

export default function DayBanner({ dayName }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="bg-header h-28 md:h-32 flex items-center justify-between px-6"
    >
      <div className="text-4xl md:text-5xl font-semibold text-teal-900/40">
        {dayName}
      </div>

      {/* Simple “illustration” placeholder (you can replace later with an image) */}
      <div className="text-4xl md:text-5xl opacity-80 select-none">
        ⛸️❄️
      </div>
    </motion.div>
  );
}