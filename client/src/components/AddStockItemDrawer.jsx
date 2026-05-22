import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function AddStockItemDrawer({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    const n = name.trim();
    const c = category.trim();
    if (!n || !c || saving) return;

    try {
      setSaving(true);
      await onAdd(n, c);
      setName("");
      setCategory("");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          className="
            h-11 rounded-xl
            bg-red-600 hover:bg-red-700
            text-white font-bold
            px-3 sm:px-4
            shrink-0
          "
        >
          <Plus className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Add item</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="p-0">
        <div className="mx-auto w-full max-w-xl px-4 sm:px-6 pb-6">
          <DrawerHeader className="p-0 mb-3 sm:mb-4">
            <DrawerTitle className="text-base sm:text-lg">
              Add stock item
            </DrawerTitle>
          </DrawerHeader>

          <div className="space-y-3">
            <div>
              <div className="text-[11px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Item name
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Cups 12oz"
                className="w-full h-12 rounded-xl border border-gray-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>

            <div>
              <div className="text-[11px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Category
              </div>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Hot drinks / Cleaning / Food"
                className="w-full h-12 rounded-xl border border-gray-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="secondary"
                className="h-12 rounded-xl order-2 sm:order-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button
                className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex-1 order-1 sm:order-2"
                onClick={submit}
                disabled={!name.trim() || !category.trim() || saving}
              >
                {saving ? "Adding..." : "Add to this shell"}
              </Button>
            </div>

            <div className="text-[11px] sm:text-xs text-gray-500 pt-1">
              Note: this adds the item to the current shell only (default: in
              stock).
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
