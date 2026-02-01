const Shell = require("../models/Shell.model");
const { ok } = require("../utils/response.util");

async function listShells(req, res, next) {
  try {
    const shells = await Shell.find({ isActive: true }).sort({ name: 1 }).lean();
    return ok(res, shells);
  } catch (e) {
    next(e);
  }
}

module.exports = { listShells };