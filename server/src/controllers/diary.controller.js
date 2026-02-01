const DiaryEntry = require("../models/DiaryEntry.model");
const IssueType = require("../models/IssueType.model");
const { ok } = require("../utils/response.util");

async function listDiaryEntries(req, res, next) {
  try {
    const { shellId, date } = req.query;
    if (!shellId) return res.status(400).json({ ok: false, message: "shellId is required" });

    const filter = { shellId };
    if (date) filter.date = date;

    const entries = await DiaryEntry.find(filter)
      .sort({ createdAt: -1 })
      .populate("staffId", "name")
      .populate("issueTypeId", "name")
      .lean();

    return ok(res, entries);
  } catch (e) {
    next(e);
  }
}

/**
 * Create entry:
 * - if issueTypeId given -> use it
 * - else create IssueType using newIssueTypeName (then use it)
 */
async function createDiaryEntry(req, res, next) {
  try {
    const { shellId, staffId, issueTypeId, newIssueTypeName, date, time, description } = req.body;

    let finalIssueTypeId = issueTypeId;

    if (!finalIssueTypeId) {
      const createdType = await IssueType.create({
        shellId,
        createdByStaffId: staffId,
        name: newIssueTypeName
      });
      finalIssueTypeId = createdType._id;
    }

    const created = await DiaryEntry.create({
      shellId,
      staffId,
      issueTypeId: finalIssueTypeId,
      date,
      time,
      description
    });

    const populated = await DiaryEntry.findById(created._id)
      .populate("staffId", "name")
      .populate("issueTypeId", "name")
      .lean();

    return ok(res, populated, "DIARY_ENTRY_CREATED");
  } catch (e) {
    if (e.code === 11000) {
      e.statusCode = 409;
      e.message = "DUPLICATE_KEY";
    }
    next(e);
  }
}

module.exports = { listDiaryEntries, createDiaryEntry };