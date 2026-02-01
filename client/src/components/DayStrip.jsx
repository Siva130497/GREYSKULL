import dayjs from "dayjs";

export default function DayStrip({ selectedDate, onChange }) {
  const start = dayjs().startOf("week"); // Mon-based later if needed
  const days = Array.from({ length: 7 }).map((_, i) =>
    start.add(i, "day")
  );

  return (
    <div className="flex justify-between px-4 py-3 bg-white border-b">
      {days.map(day => {
        const isToday = day.format("YYYY-MM-DD") === selectedDate;
        return (
          <button
            key={day.format("YYYY-MM-DD")}
            onClick={() => onChange(day.format("YYYY-MM-DD"))}
            className={`flex flex-col items-center text-sm ${
              isToday
                ? "text-header font-semibold"
                : "text-gray-400"
            }`}
          >
            <span>{day.format("ddd")}</span>
            <span className="text-xs">{day.format("DD")}</span>
            {isToday && (
              <div className="w-6 h-0.5 bg-header mt-1 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}