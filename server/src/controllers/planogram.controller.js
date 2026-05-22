const Planogram = require("../models/Planogram.model");
const { ok } = require("../utils/response.util");

// GET /api/planograms?shellId=X
// Returns the list WITHOUT the photo blob for performance.
async function listPlanograms(req, res, next) {
  try {
    const { shellId, status } = req.query;
    if (!shellId)
      return res.status(400).json({ ok: false, message: "shellId is required" });

    const filter = { shellId };
    if (status) filter.status = status;

    const items = await Planogram.find(filter)
      .sort({ createdAt: -1 })
      .select("-photoDataUrl")
      .populate("uploadedByStaffId", "name role")
      .populate("markedLiveByStaffId", "name role")
      .lean();

    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

// GET /api/planograms/:id — full doc including the photo
async function getPlanogram(req, res, next) {
  try {
    const item = await Planogram.findById(req.params.id)
      .populate("uploadedByStaffId", "name role")
      .populate("markedLiveByStaffId", "name role")
      .lean();
    if (!item) return res.status(404).json({ ok: false, message: "NOT_FOUND" });
    return ok(res, item);
  } catch (e) {
    next(e);
  }
}

// POST /api/planograms  (manager / super_admin only)
//   body: { shellId, title, notes?, photoDataUrl }
async function createPlanogram(req, res, next) {
  try {
    const { shellId, title, notes, photoDataUrl } = req.body || {};
    if (!shellId || !title || !photoDataUrl) {
      return res
        .status(400)
        .json({ ok: false, message: "shellId, title, photoDataUrl required" });
    }
    if (!String(photoDataUrl).startsWith("data:image/")) {
      return res
        .status(400)
        .json({ ok: false, message: "photoDataUrl must be a data: image URL" });
    }

    const created = await Planogram.create({
      shellId,
      title: String(title).trim(),
      notes: notes ? String(notes).trim() : "",
      photoDataUrl,
      uploadedByStaffId: req.user._id,
    });

    const populated = await Planogram.findById(created._id)
      .populate("uploadedByStaffId", "name role")
      .lean();
    return ok(res, populated, "CREATED");
  } catch (e) {
    next(e);
  }
}

// PATCH /api/planograms/:id (anyone authenticated)
//   - body: { markLive: true } to mark as live
//   - body: { markLive: false } to revert to pending
//   - body: { title?, notes? } (manager/super_admin only — enforced at route layer for the others)
async function updatePlanogram(req, res, next) {
  try {
    const doc = await Planogram.findById(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "NOT_FOUND" });

    const { markLive, title, notes } = req.body || {};

    if (markLive === true) {
      doc.status = "live";
      doc.markedLiveByStaffId = req.user._id;
      doc.markedLiveAt = new Date();
    } else if (markLive === false) {
      doc.status = "pending";
      doc.markedLiveByStaffId = null;
      doc.markedLiveAt = null;
    }

    // Only managers / super_admins can rename or edit notes
    if (typeof title === "string" || typeof notes === "string") {
      if (!["manager", "super_admin"].includes(req.user.role)) {
        return res
          .status(403)
          .json({ ok: false, message: "FORBIDDEN_EDIT_TEXT" });
      }
      if (typeof title === "string" && title.trim()) doc.title = title.trim();
      if (typeof notes === "string") doc.notes = notes.trim();
    }

    await doc.save();
    const populated = await Planogram.findById(doc._id)
      .populate("uploadedByStaffId", "name role")
      .populate("markedLiveByStaffId", "name role")
      .lean();
    return ok(res, populated, "UPDATED");
  } catch (e) {
    next(e);
  }
}

// DELETE /api/planograms/:id (manager / super_admin only — enforced at route layer)
async function deletePlanogram(req, res, next) {
  try {
    const doc = await Planogram.findById(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "NOT_FOUND" });
    await Planogram.deleteOne({ _id: doc._id });
    return ok(res, { _id: doc._id }, "DELETED");
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listPlanograms,
  getPlanogram,
  createPlanogram,
  updatePlanogram,
  deletePlanogram,
};
