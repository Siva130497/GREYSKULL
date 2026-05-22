const TradingLog = require("../models/TradingLog.model");
const Shell = require("../models/Shell.model");
const { ok } = require("../utils/response.util");

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function nowHHmm() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// GET /api/trading?shellId=X&date=YYYY-MM-DD
// Returns { shell, log } for a single day. `date` defaults to today.
async function getDay(req, res, next) {
  try {
    const { shellId } = req.query;
    const date = req.query.date || todayStr();
    if (!shellId) return res.status(400).json({ ok: false, message: "shellId is required" });

    const shell = await Shell.findById(shellId).lean();
    if (!shell) return res.status(404).json({ ok: false, message: "SHELL_NOT_FOUND" });

    const log = await TradingLog.findOne({ shellId, date })
      .populate("openedByStaffId", "name")
      .populate("closedByStaffId", "name")
      .lean();

    return ok(res, { shell, date, log });
  } catch (e) {
    next(e);
  }
}

// GET /api/trading/history?shellId=X&limit=14
async function getHistory(req, res, next) {
  try {
    const { shellId } = req.query;
    const limit = Math.min(parseInt(req.query.limit || "14", 10), 90);
    if (!shellId) return res.status(400).json({ ok: false, message: "shellId is required" });

    const logs = await TradingLog.find({ shellId })
      .sort({ date: -1 })
      .limit(limit)
      .populate("openedByStaffId", "name")
      .populate("closedByStaffId", "name")
      .lean();

    return ok(res, logs);
  } catch (e) {
    next(e);
  }
}

// POST /api/trading/open  body: { shellId, time? } — time defaults to now (HH:mm)
async function logOpen(req, res, next) {
  try {
    const { shellId } = req.body || {};
    const time = req.body?.time || nowHHmm();
    if (!shellId) return res.status(400).json({ ok: false, message: "shellId is required" });

    const shell = await Shell.findById(shellId).lean();
    if (!shell) return res.status(404).json({ ok: false, message: "SHELL_NOT_FOUND" });
    if (shell.is24x7) {
      return res.status(400).json({ ok: false, message: "SHELL_IS_24X7_NO_OPEN_LOG" });
    }

    const date = todayStr();
    const updated = await TradingLog.findOneAndUpdate(
      { shellId, date },
      {
        $setOnInsert: { shellId, date },
        $set: { openedAt: time, openedByStaffId: req.user._id },
      },
      { new: true, upsert: true }
    )
      .populate("openedByStaffId", "name")
      .populate("closedByStaffId", "name");

    return ok(res, updated, "OPEN_LOGGED");
  } catch (e) {
    next(e);
  }
}

// POST /api/trading/close body: { shellId, time? }
async function logClose(req, res, next) {
  try {
    const { shellId } = req.body || {};
    const time = req.body?.time || nowHHmm();
    if (!shellId) return res.status(400).json({ ok: false, message: "shellId is required" });

    const shell = await Shell.findById(shellId).lean();
    if (!shell) return res.status(404).json({ ok: false, message: "SHELL_NOT_FOUND" });
    if (shell.is24x7) {
      return res.status(400).json({ ok: false, message: "SHELL_IS_24X7_NO_CLOSE_LOG" });
    }

    const date = todayStr();
    const updated = await TradingLog.findOneAndUpdate(
      { shellId, date },
      {
        $setOnInsert: { shellId, date },
        $set: { closedAt: time, closedByStaffId: req.user._id },
      },
      { new: true, upsert: true }
    )
      .populate("openedByStaffId", "name")
      .populate("closedByStaffId", "name");

    return ok(res, updated, "CLOSE_LOGGED");
  } catch (e) {
    next(e);
  }
}

module.exports = { getDay, getHistory, logOpen, logClose };
