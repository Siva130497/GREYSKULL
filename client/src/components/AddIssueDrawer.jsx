import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      setErr("Please select a category.");
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
    } catch {
      setErr("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          className="
            h-12 sm:h-14
            px-4 sm:px-5
            rounded-full
            bg-red-600 hover:bg-red-700
            text-white
            shadow-lg
            flex items-center gap-2 sm:gap-3
            text-sm font-semibold tracking-wide
            focus:outline-none
          "
          title="Add entry"
        >
          <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <span className="hidden sm:inline">Add entry</span>
        </motion.button>
      </DrawerTrigger>

      <DrawerContent className="p-0">
        <div className="mx-auto w-full max-w-xl px-4 sm:px-6 pb-5 sm:pb-6">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-base sm:text-lg">
              Add Station Entry
            </DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Category
              </div>

              <Select value={issueTypeId} onValueChange={setIssueTypeId}>
                <SelectTrigger className="h-12 rounded-xl text-base">
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

              {issueTypes.length === 0 && (
                <div className="text-xs text-red-600 mt-2">
                  No categories found. Seed issue types in DB first.
                </div>
              )}
            </div>

            <div>
              <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Description
              </div>
              <Textarea
                placeholder="Describe the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] sm:min-h-[120px] rounded-xl text-base"
              />
            </div>

            {err && (
              <div className="text-sm text-red-600 font-medium">{err}</div>
            )}

            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-base"
            >
              {saving ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
