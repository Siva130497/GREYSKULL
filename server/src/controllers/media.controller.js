const MediaItem = require("../models/MediaItem.model");
const { ok } = require("../utils/response.util");

async function listMedia(req, res, next) {
  try {
    const { shellId } = req.query;

    // allow global (shellId = null) + specific shell items
    const filter = shellId
      ? { $or: [{ shellId: null }, { shellId }] }
      : { shellId: null };

    const items = await MediaItem.find(filter).sort({ order: 1, title: 1 }).lean();
    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

async function createMedia(req, res, next) {
  try {
    const created = await MediaItem.create(req.body);
    return ok(res, created, "MEDIA_CREATED");
  } catch (e) {
    next(e);
  }
}

module.exports = { listMedia, createMedia };