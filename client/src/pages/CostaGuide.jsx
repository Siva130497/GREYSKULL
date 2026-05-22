import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProfileMenu from "../components/ProfileMenu";

const VIDEO = {
  title: "Costa Machine Cleaning – Video Guide",
  url: "https://drive.google.com/file/d/1v8gmq0i_nknmbSs702GrdZFAzwphfjEO/preview",
};

const PDFS = [
  {
    title: "Costa Machine Manual Guide",
    url: "https://drive.google.com/file/d/1Gi2HcNhPeqTfK8_wbgbLuksmTBZfTcVb/preview",
  },
  {
    title: "Cleaning Best Practices & Key Points",
    url: "https://drive.google.com/file/d/1Pg2zG_pRq2PTm-6yQrzRu6vED5cpnlEX/preview",
  },
  {
    title: "Machine Cleaning Top Tips",
    url: "https://drive.google.com/file/d/1ZO7f10s7BhzKKMgwNL9XL-VO_mbcppps/preview",
  },
];

function driveIdFromPreview(url = "") {
  const match = url.match(/\/d\/([^/]+)\//);
  return match?.[1] || "";
}

function driveThumb(url, size = 600) {
  const id = driveIdFromPreview(url);
  if (!id) return "";
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
}

export default function CostaGuide() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  function openDoc(doc) {
    setActive(doc);
    setOpen(true);
  }

  return (
    <div className="bg-shellbg p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 260px at 20% 20%, rgba(168,50,94,0.20) 0%, transparent 55%)," +
              "radial-gradient(700px 240px at 85% 35%, rgba(111,29,58,0.18) 0%, transparent 60%)," +
              "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.86) 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />

        <div className="relative p-4 sm:p-5 md:p-6 flex items-center justify-between gap-4 sm:gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span
                className="
                  inline-flex items-center
                  px-2 sm:px-3 py-0.5 sm:py-1
                  rounded-full
                  text-[10px] sm:text-xs font-semibold tracking-wide
                  bg-[#6f1d3a]/10 text-[#6f1d3a] border border-[#6f1d3a]/15
                "
              >
                COSTA
              </span>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                Costa Guide
              </h1>
            </div>

            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-[15px] text-gray-600 max-w-2xl">
              Cleaning procedures, machine manuals & daily compliance documents
              for Costa operations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center justify-center w-14 h-14 rounded-2xl bg-[#6f1d3a]/10 border border-[#6f1d3a]/15">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 8h10v6a5 5 0 0 1-5 5H9a2 2 0 0 1-2-2V8Z"
                  stroke="rgba(111,29,58,0.9)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 10h1a3 3 0 0 1 0 6h-1"
                  stroke="rgba(111,29,58,0.9)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 3s1 1 1 2-1 2-1 2M12 3s1 1 1 2-1 2-1 2M16 3s1 1 1 2-1 2-1 2"
                  stroke="rgba(111,29,58,0.55)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <ProfileMenu />
          </div>
        </div>

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[120%] h-16 rounded-[100%] bg-black/5 blur-xl" />
      </div>

      {/* Operational rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Golden Time */}
        <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(600px 200px at 100% 0%, rgba(245,158,11,0.20) 0%, transparent 60%)",
            }}
          />
          <div className="relative p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                GOLDEN TIME
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                6:00 AM – 12:00 PM
              </span>
            </div>

            <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 leading-snug">
              Never open the machine during golden time
            </h3>

            <ul className="mt-2.5 sm:mt-3 space-y-2 text-sm md:text-[15px] text-gray-700">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  Do not open the Costa machine between{" "}
                  <strong>6 AM and 12 PM</strong>.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  Refill and prepare everything <strong>before 6 AM</strong> or{" "}
                  <strong>after 12 PM</strong>.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  Only break this rule in a genuine <strong>emergency</strong>.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Maintenance Protocol */}
        <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(600px 200px at 100% 0%, rgba(220,38,38,0.18) 0%, transparent 60%)",
            }}
          />
          <div className="relative p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider bg-red-100 text-red-700 border border-red-200">
                IF SOMETHING GOES WRONG
              </span>
            </div>

            <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 leading-snug">
              Do not try to fix the machine yourself
            </h3>

            <ul className="mt-2.5 sm:mt-3 space-y-2 text-sm md:text-[15px] text-gray-700">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                <span>
                  If the machine fails or behaves unexpectedly,{" "}
                  <strong>do not attempt a repair</strong>.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                <span>
                  Call <strong>Costa Maintenance</strong> immediately and take a{" "}
                  <strong>reference number</strong>.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                <span>
                  If it is <strong>out of hours</strong>, wait and call again in
                  the morning.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Video */}
      <div className="bg-white rounded-2xl shadow-sm border p-3 sm:p-4 md:p-5">
        <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">
          {VIDEO.title}
        </h2>

        <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-black">
          <iframe
            src={VIDEO.url}
            className="absolute inset-0 w-full h-full"
            allow="autoplay"
            allowFullScreen
            title="Costa Cleaning Video"
          />
        </div>
      </div>

      {/* Documents */}
      <div>
        <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
          Documents
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {PDFS.map((doc) => {
            const thumb = driveThumb(doc.url, 800);

            return (
              <button
                key={doc.url}
                onClick={() => openDoc(doc)}
                className="
                  group
                  bg-white
                  rounded-2xl
                  border
                  shadow-sm
                  overflow-hidden
                  text-left
                  hover:shadow-md
                  active:scale-[0.99]
                  transition
                "
              >
                <div className="relative h-32 sm:h-40 bg-gray-100 overflow-hidden">
                  {thumb && (
                    <img
                      src={thumb}
                      alt={doc.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                  <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold tracking-wide bg-white/90 text-[#6f1d3a] border border-white/70">
                    PDF
                  </div>

                  <div className="absolute bottom-2.5 sm:bottom-3 right-2.5 sm:right-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/15 text-white border border-white/25 backdrop-blur-sm">
                    Tap to open
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <div className="font-semibold text-sm sm:text-base text-gray-900 leading-snug line-clamp-2">
                    {doc.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-500 mt-1">
                    Costa document
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fullscreen viewer */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="
            w-[96vw] sm:w-[95vw]
            max-w-[96vw] sm:max-w-[1100px]
            h-[90vh] sm:h-[92vh]
            p-0
            overflow-hidden
            rounded-2xl
            flex flex-col
          "
        >
          <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b bg-white">
            <div className="font-semibold text-sm sm:text-base text-gray-900 truncate pr-8">
              {active?.title}
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-black">
            {active && (
              <iframe
                src={active.url}
                className="w-full h-full"
                allowFullScreen
                title={active.title}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
