const router = require("express").Router();
const { listDiaryEntries, createDiaryEntry } = require("../controllers/diary.controller");
const { validateBody } = require("../middlewares/validate.middleware");
const { createDiaryEntrySchema } = require("../validations/diary.validation");

router.get("/", listDiaryEntries);
router.post("/", validateBody(createDiaryEntrySchema), createDiaryEntry);
// PUT /api/diary/:id  (update)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { issueTypeId, description } = req.body;

    if (!issueTypeId || !description || String(description).trim().length < 1) {
      return res.status(400).json({ ok: false, message: "VALIDATION_ERROR", data: null });
    }

    const updated = await DiaryEntry.findByIdAndUpdate(
      id,
      { issueTypeId, description: String(description).trim() },
      { new: true }
    )
      .populate("issueTypeId", "name")
      .populate("staffId", "name");

    if (!updated) {
      return res.status(404).json({ ok: false, message: "NOT_FOUND", data: null });
    }

    return res.json({ ok: true, message: "SUCCESS", data: updated });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "SERVER_ERROR", data: null });
  }
});

// DELETE /api/diary/:id (delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await DiaryEntry.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ ok: false, message: "NOT_FOUND", data: null });
    }

    return res.json({ ok: true, message: "SUCCESS", data: { id } });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "SERVER_ERROR", data: null });
  }
});

module.exports = router;