const Staff = require("../models/Staff.model");
const Shell = require("../models/Shell.model");
const { ok } = require("../utils/response.util");

/**
 * "Login" = validate staff belongs to shell.
 * No password. We return staff + shell info so frontend can store it.
 */
async function login(req, res, next) {
  try {
    const { shellId, staffId } = req.body;

    const shell = await Shell.findById(shellId).lean();
    if (!shell) return res.status(404).json({ ok: false, message: "SHELL_NOT_FOUND" });

    const staff = await Staff.findOne({ _id: staffId, shellId }).lean();
    if (!staff) return res.status(404).json({ ok: false, message: "STAFF_NOT_FOUND_FOR_SHELL" });

    return ok(res, {
      shell: { _id: shell._id, name: shell.name },
      staff: { _id: staff._id, name: staff.name }
    }, "LOGIN_OK");
  } catch (e) {
    next(e);
  }
}

module.exports = { login };