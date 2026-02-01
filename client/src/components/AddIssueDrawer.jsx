import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AddIssueDrawer({ issueTypes = [], onSubmit }) {
  const [open, setOpen] = useState(false);
  const [issueTypeId, setIssueTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    return issueTypeId && description.trim().length >= 2 && !saving;
  }, [issueTypeId, description, saving]);

  async function handleSave() {
    setErr("");

    if (!issueTypeId) {
      setErr("Please select a category (Issues / Site closers / Call logs / Sales etc).");
      return;
    }
    if (description.trim().length < 2) {
      setErr("Please enter a short description.");
      return;
    }

    try {
      setSaving(true);
      await onSubmit(issueTypeId, description.trim());
      setDescription("");
      setIssueTypeId("");
      setOpen(false);
    } catch (e) {
      setErr("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {/* Floating button */}
<DrawerTrigger asChild>
  <motion.button
    whileTap={{ scale: 0.96 }}
    whileHover={{ scale: 1.02 }}
    className="
      h-14
      px-5
      rounded-full
      bg-red-600
      hover:bg-red-700
      text-white
      shadow-lg
      flex
      items-center
      gap-3
      text-sm
      font-semibold
      tracking-wide
      focus:outline-none
    "
    title="Add entry"
  >
    {/* Plus icon */}
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-lg leading-none">
      +
    </span>

    <span>Add entry</span>
  </motion.button>
</DrawerTrigger>

      <DrawerContent className="px-5 pb-5">
        <DrawerHeader className="px-0">
          <DrawerTitle>Add Station Entry</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4">
          {/* Issue type dropdown */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">
              Category
            </div>

            <Select value={issueTypeId} onValueChange={setIssueTypeId}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* If there are zero issue types */}
            {issueTypes.length === 0 && (
              <div className="text-xs text-red-600 mt-2">
                No categories found. Seed issue types in DB first.
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">
              Description
            </div>
            <Textarea
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[90px] rounded-xl"
            />
          </div>

          {err && (
            <div className="text-sm text-red-600 font-medium">{err}</div>
          )}

          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700"
          >
            {saving ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}