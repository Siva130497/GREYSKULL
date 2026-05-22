import { useEffect, useState } from "react";
import { Wrench, CalendarDays, PhoneCall, CheckCircle2 } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

function pad(n) {
  return String(n).padStart(2, "0");
}
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function nowLocalDateTime() {
  const d = new Date();
  return `${todayStr()}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Form drawer for creating or editing a Costa machine fault.
 *  - For "create" pass `fault={ shellId }` (or `null` — shellId will be added by caller).
 *  - For "edit" pass the existing fault doc.
 */
export default function CostaFaultDrawer({ open, onClose, fault, onSubmit, saving }) {
  const isEdit = !!fault?._id;

  const [date, setDate] = useState(todayStr());
  const [faultText, setFaultText] = useState("");
  const [reportedAt, setReportedAt] = useState(nowLocalDateTime());
  const [fixedAt, setFixedAt] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) {
      setErr("");
      return;
    }
    if (isEdit) {
      setDate(fault.date || todayStr());
      setFaultText(fault.fault || "");
      setReportedAt(toLocalDT(fault.reportedAt));
      setFixedAt(fault.fixedAt ? toLocalDT(fault.fixedAt) : "");
    } else {
      setDate(todayStr());
      setFaultText("");
      setReportedAt(nowLocalDateTime());
      setFixedAt("");
    }
  }, [open, isEdit, fault]);

  function toLocalDT(d) {
    if (!d) return "";
    const x = new Date(d);
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
  }

  async function submit(e) {
    e?.preventDefault?.();
    setErr("");
    if (!date) return setErr("Please pick the fault date.");
    if (faultText.trim().length < 2)
      return setErr("Please describe the fault.");
    if (!reportedAt) return setErr("Please set when it was reported.");

    try {
      await onSubmit({
        date,
        fault: faultText.trim(),
        reportedAt: new Date(reportedAt).toISOString(),
        fixedAt: fixedAt ? new Date(fixedAt).toISOString() : null,
      });
    } catch {
      setErr("Couldn't save. Try again.");
    }
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="p-0">
        <div className="mx-auto w-full max-w-xl px-4 sm:px-6 pb-6">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-base sm:text-lg flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#6f1d3a]" />
              {isEdit ? "Edit fault" : "Log a Costa machine fault"}
            </DrawerTitle>
          </DrawerHeader>

          <form onSubmit={submit} className="space-y-3 sm:space-y-4">
            <Field
              label="Fault date"
              hint="The day the fault happened."
              Icon={CalendarDays}
            >
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 rounded-xl border border-gray-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#6f1d3a]/30"
              />
            </Field>

            <Field label="What happened" Icon={Wrench}>
              <textarea
                value={faultText}
                onChange={(e) => setFaultText(e.target.value)}
                placeholder="e.g. Steam wand not producing pressure"
                className="w-full min-h-[88px] rounded-xl border border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#6f1d3a]/30"
              />
            </Field>

            <Field
              label="Reported at"
              hint="When you called Costa Maintenance."
              Icon={PhoneCall}
            >
              <input
                type="datetime-local"
                value={reportedAt}
                onChange={(e) => setReportedAt(e.target.value)}
                className="w-full h-12 rounded-xl border border-gray-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#6f1d3a]/30"
              />
            </Field>

            <Field
              label="Fixed at"
              hint="Leave blank if the engineer hasn't fixed it yet."
              Icon={CheckCircle2}
            >
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={fixedAt}
                  onChange={(e) => setFixedAt(e.target.value)}
                  className="flex-1 h-12 rounded-xl border border-gray-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                {fixedAt && (
                  <button
                    type="button"
                    onClick={() => setFixedAt("")}
                    className="h-12 px-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition"
                  >
                    Clear
                  </button>
                )}
              </div>
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
                disabled={saving}
                className="h-12 px-4 rounded-xl bg-[#6f1d3a] hover:bg-[#5b1730] text-white font-bold text-sm flex-1 order-1 sm:order-2 disabled:opacity-50 active:scale-[0.99] transition"
              >
                {saving ? "Saving…" : isEdit ? "Save changes" : "Log fault"}
              </button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Field({ label, hint, Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" />}
        <div className="text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider">
          {label}
        </div>
      </div>
      {hint && <div className="text-[11px] text-gray-500 mb-1.5">{hint}</div>}
      {children}
    </div>
  );
}
