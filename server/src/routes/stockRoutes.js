const express = require("express");
const router = express.Router();

const EssentialItem = require("../models/EssentialItem");
const ShellStockItem = require("../models/ShellStockItem");

/**
 * GET /api/stock?shellId=...
 * Returns:
 *  - items: out-of-stock first
 *  - outCount
 *  - categories list
 */
router.get("/", async (req, res) => {
  try {
    const { shellId } = req.query;
    if (!shellId) {
      return res.status(400).json({ ok: false, message: "VALIDATION_ERROR", data: null });
    }

    const docs = await ShellStockItem.find({ shellId })
      .populate("itemId", "name category")
      .lean();

    const items = docs.map((d) => ({
      _id: d._id,
      shellId: d.shellId,
      inStock: !!d.inStock,
      item: {
        _id: d.itemId?._id,
        name: d.itemId?.name || "",
        category: d.itemId?.category || "Uncategorised",
      },
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    // out-of-stock first
    items.sort((a, b) => Number(a.inStock) - Number(b.inStock) || a.item.name.localeCompare(b.item.name));

    const outCount = items.filter((x) => !x.inStock).length;

    // category list
    const categories = Array.from(new Set(items.map((x) => x.item.category))).sort((a, b) => a.localeCompare(b));

    return res.json({
      ok: true,
      message: "SUCCESS",
      data: { items, outCount, categories },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "SERVER_ERROR", data: null });
  }
});

/**
 * PATCH /api/stock/:shellStockId/toggle
 * flips inStock
 */
router.patch("/:shellStockId/toggle", async (req, res) => {
  try {
    const { shellStockId } = req.params;

    const doc = await ShellStockItem.findById(shellStockId);
    if (!doc) {
      return res.status(404).json({ ok: false, message: "NOT_FOUND", data: null });
    }

    doc.inStock = !doc.inStock;
    await doc.save();

    return res.json({
      ok: true,
      message: "UPDATED",
      data: { _id: doc._id, inStock: doc.inStock },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "SERVER_ERROR", data: null });
  }
});

/**
 * POST /api/stock
 * body: { shellId, name, category }
 * creates master item if not exists and links to shell with inStock=true
 */
router.post("/", async (req, res) => {
  try {
    const { shellId, name, category } = req.body;

    if (!shellId || !name || !category) {
      return res.status(400).json({ ok: false, message: "VALIDATION_ERROR", data: null });
    }

    const cleanName = String(name).trim();
    const cleanCategory = String(category).trim();

    // upsert master
    const item = await EssentialItem.findOneAndUpdate(
      { name: cleanName },
      { $set: { name: cleanName, category: cleanCategory } },
      { upsert: true, new: true }
    );

    // link to shell
    const link = await ShellStockItem.findOneAndUpdate(
      { shellId, itemId: item._id },
      { $setOnInsert: { inStock: true } },
      { upsert: true, new: true }
    );

    return res.json({
      ok: true,
      message: "CREATED",
      data: { _id: link._id, shellId: link.shellId, itemId: item._id, inStock: link.inStock },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "SERVER_ERROR", data: null });
  }
});

/**
 * DELETE /api/stock/:shellStockId
 * removes the item from this shell (does not delete master item)
 */
router.delete("/:shellStockId", async (req, res) => {
  try {
    const { shellStockId } = req.params;
    await ShellStockItem.deleteOne({ _id: shellStockId });

    return res.json({ ok: true, message: "DELETED", data: null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "SERVER_ERROR", data: null });
  }
});

module.exports = router;