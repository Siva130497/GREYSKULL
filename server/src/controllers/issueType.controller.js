const IssueType = require("../models/IssueType.model");
const { ok } = require("../utils/response.util");

async function listIssueTypes(req, res, next) {
  try {
    const { shellId } = req.query;
    const filter = shellId ? { shellId } : {};
    const types = await IssueType.find(filter).sort({ name: 1 }).lean();
    return ok(res, types);
  } catch (e) {
    next(e);
  }
}

async function createIssueType(req, res, next) {
  try {
    const { shellId, staffId, name } = req.body;

    const created = await IssueType.create({
      shellId,
      createdByStaffId: staffId,
      name
    });

    return ok(res, created, "ISSUE_TYPE_CREATED");
  } catch (e) {
    // handle duplicate nicely
    if (e.code === 11000) {
      e.statusCode = 409;
      e.message = "ISSUE_TYPE_ALREADY_EXISTS";
    }
    next(e);
  }
}

module.exports = { listIssueTypes, createIssueType };