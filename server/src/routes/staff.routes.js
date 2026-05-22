const router = require("express").Router();
const {
  listStaffByShell,
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} = require("../controllers/staff.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

// Public-ish: used by login picker compatibility (kept open for legacy flows)
router.get("/by-shell/:shellId", listStaffByShell);

// Admin CRUD — super_admin only
router.get("/", requireAuth, requireRole("super_admin"), listStaff);
router.post("/", requireAuth, requireRole("super_admin"), createStaff);
router.patch("/:id", requireAuth, requireRole("super_admin"), updateStaff);
router.delete("/:id", requireAuth, requireRole("super_admin"), deleteStaff);

module.exports = router;
