const router = require("express").Router();
const {
  listFaults,
  createFault,
  updateFault,
  deleteFault,
} = require("../controllers/costaFault.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.get("/", listFaults);
router.post("/", requireAuth, createFault);
router.patch("/:id", requireAuth, updateFault);
router.delete("/:id", requireAuth, deleteFault);

module.exports = router;
