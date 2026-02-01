import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function AddStockItemDrawer({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  async function submit() {
    const n = name.trim();
    const c = category.trim();
    if (!n || !c) return;

    await onAdd(n, c);

    setName("");
    setCategory("");
    setOpen(false);
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold">
          + Add item
        </Button>
      </DrawerTrigger>

      <DrawerContent className="p-0">
        <div className="max-w-2xl mx-auto w-full p-6">
          <DrawerHeader className="p-0 mb-4">
            <DrawerTitle>Add stock item</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Item name
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Cups 12oz"
                className="w-full h-12 rounded-xl border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Category
              </div>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Hot drinks / Cleaning / Food"
                className="w-full h-12 rounded-xl border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <Button
                variant="secondary"
                className="h-12 rounded-xl"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button
                className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex-1"
                onClick={submit}
                disabled={!name.trim() || !category.trim()}
              >
                Add to this shell
              </Button>
            </div>

            <div className="text-xs text-gray-500 pt-1">
              Note: this adds the item to the current shell only (default: in stock).
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}