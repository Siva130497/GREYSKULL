const Staff = require("../models/Staff.model");
const { ok } = require("../utils/response.util");

async function listStaffByShell(req, res, next) {
  try {
    const { shellId } = req.params;
    const staff = await Staff.find({ shellId, isActive: true }).sort({ name: 1 }).lean();
    return ok(res, staff);
  } catch (e) {
    next(e);
  }
}

module.exports = { listStaffByShell };