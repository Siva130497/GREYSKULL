import { useEffect, useState } from "react";
import { Upload, ImagePlus, Loader2 } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { fileToCompressedDataUrl } from "../lib/image";

export default function PlanogramUploadDrawer({ open, onClose, onSubmit, saving }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dataUrl, setDataUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setNotes("");
      setDataUrl("");
      setErr("");
      setProcessing(false);
    }
  }, [open]);

  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    try {
      setProcessing(true);
      const url = await fileToCompressedDataUrl(file, 1280, 0.82);
      setDataUrl(url);
    } catch (e2) {
      setErr(e2?.message || "Couldn't read that image.");
    } finally {
      setProcessing(false);
    }
  }

  async function submit(e) {
    e?.preventDefault?.();
    setErr("");
    if (!title.trim()) return setErr("Please give the planogram a title.");
    if (!dataUrl) return setErr("Please attach a photo.");
    try {
      await onSubmit({
        title: title.trim(),
        notes: notes.trim(),
        photoDataUrl: dataUrl,
      });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Upload failed. Try again.");
    }
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="p-0">
        <div className="mx-auto w-full max-w-xl px-4 sm:px-6 pb-6">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-base sm:text-lg flex items-center gap-2">
              <Upload className="w-4 h-4 text-violet-600" />
              Upload new planogram
            </DrawerTitle>
          </DrawerHeader>

          <form onSubmit={submit} className="space-y-3 sm:space-y-4">
            <Field label="Title" hint="e.g. Q2 2026 wine bay layout">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Quarter & section"
                className="w-full h-12 rounded-xl border border-gray-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            </Field>

            <Field
              label="Notes (optional)"
              hint="Anything the team should know — special instructions, deadlines, etc."
            >
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional"
                className="w-full min-h-[72px] rounded-xl border border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            </Field>

            <Field label="Planogram photo">
              <label
                htmlFor="planogram-file"
                className="
                  relative block w-full rounded-xl border-2 border-dashed border-gray-200
                  bg-gray-50/60 hover:bg-gray-50 transition cursor-pointer
                  overflow-hidden
                "
              >
                {dataUrl ? (
                  <div className="relative">
                    <img
                      src={dataUrl}
                      alt="planogram preview"
                      className="w-full max-h-72 object-contain bg-white"
                    />
                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/70 text-white text-[11px] font-bold">
                      Change photo
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    {processing ? (
                      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                    ) : (
                      <ImagePlus className="w-8 h-8 text-gray-400" />
                    )}
                    <div className="mt-2 text-sm font-semibold text-gray-700">
                      {processing ? "Processing…" : "Tap to attach a photo"}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Camera or library · resized to 1280px JPEG
                    </div>
                  </div>
                )}
                <input
                  id="planogram-file"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onPick}
                  className="hidden"
                />
              </label>
            </Field>

            {err && (
              <div className="text-sm text-red-600 font-medium bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {err}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || processing || !dataUrl || !title.trim()}
                className="h-12 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm flex-1 order-1 sm:order-2 disabled:opacity-50 active:scale-[0.99] transition inline-flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
                  </>
                ) : (
                  "Upload planogram"
                )}
              </button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
        {label}
      </div>
      {hint && <div className="text-[11px] text-gray-500 mb-1.5">{hint}</div>}
      {children}
    </div>
  );
}
