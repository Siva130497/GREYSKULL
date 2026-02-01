import dayjs from "dayjs";

export default function DateCarousel({ selectedDate, onChange }) {
  const selected = dayjs(selectedDate);

  // show a week window like the screenshot (Mon..Sun-ish)
  const start = selected.subtract(3, "day");
  const days = Array.from({ length: 7 }).map((_, i) => start.add(i, "day"));

  return (
    <div className="bg-white border-b">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* left arrow */}
        <button
          onClick={() => onChange(selected.subtract(1, "day").format("YYYY-MM-DD"))}
          className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm active:scale-95 transition"
        >
          ‹
        </button>

        {/* date circles */}
        <div className="flex gap-3 items-center overflow-hidden">
          {days.map((d) => {
            const isSelected = d.format("YYYY-MM-DD") === selectedDate;
            return (
              <button
                key={d.format("YYYY-MM-DD")}
                onClick={() => onChange(d.format("YYYY-MM-DD"))}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm transition
                  ${isSelected ? "bg-yellow-400 text-gray-800" : "bg-gray-100 text-red-600"}
                `}
              >
                {d.format("D")}
              </button>
            );
          })}
        </div>

        {/* right arrow */}
        <button
          onClick={() => onChange(selected.add(1, "day").format("YYYY-MM-DD"))}
          className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm active:scale-95 transition"
        >
          ›
        </button>
      </div>
    </div>
  );
}