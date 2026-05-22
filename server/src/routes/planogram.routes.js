const router = require("express").Router();
const {
  listPlanograms,
  getPlanogram,
  createPlanogram,
  updatePlanogram,
  deletePlanogram,
} = require("../controllers/planogram.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

router.get("/", listPlanograms);
router.get("/:id", getPlanogram);

// Only managers and super_admins can upload or delete.
router.post("/", requireAuth, requireRole("manager", "super_admin"), createPlanogram);
router.delete("/:id", requireAuth, requireRole("manager", "super_admin"), deletePlanogram);

// Any authenticated user (staff included) can mark-live / un-mark-live.
router.patch("/:id", requireAuth, updatePlanogram);

module.exports = router;
