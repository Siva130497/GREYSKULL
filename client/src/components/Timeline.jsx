import { motion } from "framer-motion";

const colorMap = {
  Issues: "bg-purple",
  "Site Closers": "bg-orange",
  "Call Logs": "bg-green",
  Default: "bg-pink"
};

export default function Timeline({ entries }) {
  if (!entries.length) {
    return (
      <div className="text-center text-gray-400 py-10">
        No entries for this day
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-6">
      {entries.map((e, idx) => {
        const barColor =
          colorMap[e.issueType?.name] || colorMap.Default;

        return (
          <motion.div
            key={e._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex gap-4"
          >
            {/* vertical bar */}
            <div className={`w-1 rounded-full ${barColor}`} />

            {/* content */}
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-800">
                  {e.issueType?.name}
                </span>
                <span className="text-gray-400">{e.time}</span>
              </div>

              <p className="text-gray-600 text-sm mt-1">
                {e.description}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                by {e.staff?.name}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}