import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

export default function CostaGuide() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  function openDoc(doc) {
    setActive(doc);
    setOpen(true);
  }

  function driveIdFromPreview(url = "") {
  // expects: https://drive.google.com/file/d/<ID>/preview
  const match = url.match(/\/d\/([^/]+)\//);
  return match?.[1] || "";
}

function driveThumb(url, size = 600) {
  const id = driveIdFromPreview(url);
  if (!id) return "";
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
}

  return (
    <div className="flex-1 min-h-0 bg-shellbg p-6 space-y-8">
      {/* ✅ Premium Costa header (fixed structure) */}
      <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
        {/* soft costa tint + light streak */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 260px at 20% 20%, rgba(168,50,94,0.20) 0%, transparent 55%)," +
              "radial-gradient(700px 240px at 85% 35%, rgba(111,29,58,0.18) 0%, transparent 60%)," +
              "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.86) 100%)",
          }}
        />

        {/* subtle top sheen line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />

        <div className="relative p-6 flex items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide
                bg-[#6f1d3a]/10 text-[#6f1d3a] border border-[#6f1d3a]/15"
              >
                COSTA
              </span>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                Costa Guide
              </h1>
            </div>

            <p className="mt-2 text-sm md:text-[15px] text-gray-600 max-w-2xl">
              Cleaning procedures, machine manuals & daily compliance documents for Costa operations.
            </p>
          </div>

          {/* right-side minimal icon */}
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
        </div>

        {/* bottom subtle curve shadow */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[120%] h-16 rounded-[100%] bg-black/5 blur-xl" />
      </div>

      {/* Video section */}
      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <h2 className="text-lg font-bold mb-3">{VIDEO.title}</h2>

        {/* you asked small video window earlier — reduce max height */}
        <div className="relative w-full aspect-video max-h-[360px] md:max-h-[620px] rounded-xl overflow-hidden border">
          <iframe
            src={VIDEO.url}
            className="absolute inset-0 w-full h-full"
            allow="autoplay"
            allowFullScreen
            title="Costa Cleaning Video"
          />
        </div>
      </div>

      {/* PDFs section */}
      <div>
        <h2 className="text-lg font-bold mb-4">Documents</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
        {/* Thumbnail */}
        <div className="relative h-40 bg-gray-100 overflow-hidden">
          {thumb ? (
            <img
              src={thumb}
              alt={doc.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
              loading="lazy"
              onError={(e) => {
                // fallback if Drive blocks thumbnail
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}

          {/* Costa gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

          {/* PDF badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-extrabold tracking-wide
                          bg-white/90 text-[#6f1d3a] border border-white/70">
            PDF
          </div>

          {/* Open hint */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold
                          bg-white/15 text-white border border-white/25">
            Tap to open
          </div>
        </div>

        {/* Title */}
        <div className="p-4">
          <div className="font-semibold text-gray-900 leading-snug line-clamp-2">
            {doc.title}
          </div>
          <div className="text-xs text-gray-500 mt-1">
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
          className="
            max-w-[96vw]
            h-[92vh]
            p-0
            overflow-hidden
            rounded-2xl
            flex
            flex-col
          "
        >
          {/* Title bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b bg-white">
            <div className="font-semibold text-gray-900 truncate">
              {active?.title}
            </div>
          </div>

          {/* iframe fills remaining space */}
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