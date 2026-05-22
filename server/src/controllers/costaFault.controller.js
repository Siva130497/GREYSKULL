const CostaFault = require("../models/CostaFault.model");
const { ok } = require("../utils/response.util");

// GET /api/costa-faults?shellId=&status=
//   status: "open" | "fixed" | omitted (all)
async function listFaults(req, res, next) {
  try {
    const { shellId, status } = req.query;
    if (!shellId)
      return res.status(400).json({ ok: false, message: "shellId is required" });

    const filter = { shellId };
    if (status === "open") filter.fixedAt = null;
    if (status === "fixed") filter.fixedAt = { $ne: null };

    const items = await CostaFault.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdByStaffId", "name")
      .lean();

    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

// POST /api/costa-faults
//   body: { shellId, date, fault, reportedAt, fixedAt? }
async function createFault(req, res, next) {
  try {
    const { shellId, date, fault, reportedAt, fixedAt } = req.body || {};

    if (!shellId || !date || !fault || !reportedAt) {
      return res
        .status(400)
        .json({ ok: false, message: "shellId, date, fault, reportedAt required" });
    }
    if (String(fault).trim().length < 2) {
      return res.status(400).json({ ok: false, message: "FAULT_TOO_SHORT" });
    }

    const created = await CostaFault.create({
      shellId,
      createdByStaffId: req.user._id,
      date,
      fault: String(fault).trim(),
      reportedAt: new Date(reportedAt),
      fixedAt: fixedAt ? new Date(fixedAt) : null,
    });

    const populated = await CostaFault.findById(created._id)
      .populate("createdByStaffId", "name")
      .lean();
    return ok(res, populated, "CREATED");
  } catch (e) {
    next(e);
  }
}

// PATCH /api/costa-faults/:id
//   body: { date?, fault?, reportedAt?, fixedAt? }
//   - send fixedAt: null to mark un-fixed again
async function updateFault(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await CostaFault.findById(id);
    if (!doc) return res.status(404).json({ ok: false, message: "NOT_FOUND" });

    const { date, fault, reportedAt, fixedAt } = req.body || {};
    if (typeof date === "string" && date) doc.date = date;
    if (typeof fault === "string" && fault.trim().length >= 2) {
      doc.fault = fault.trim();
    }
    if (reportedAt) doc.reportedAt = new Date(reportedAt);
    if ("fixedAt" in (req.body || {})) {
      doc.fixedAt = fixedAt ? new Date(fixedAt) : null;
    }

    await doc.save();
    const populated = await CostaFault.findById(doc._id)
      .populate("createdByStaffId", "name")
      .lean();
    return ok(res, populated, "UPDATED");
  } catch (e) {
    next(e);
  }
}

// DELETE /api/costa-faults/:id
async function deleteFault(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await CostaFault.findById(id);
    if (!doc) return res.status(404).json({ ok: false, message: "NOT_FOUND" });
    await CostaFault.deleteOne({ _id: id });
    return ok(res, { _id: id }, "DELETED");
  } catch (e) {
    next(e);
  }
}

module.exports = { listFaults, createFault, updateFault, deleteFault };
