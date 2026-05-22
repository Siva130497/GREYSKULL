const router = require("express").Router();
const {
  getDay,
  getHistory,
  logOpen,
  logClose,
} = require("../controllers/trading.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

// Reads are public-ish (no role gate); writes need a logged-in user so we can record who did it.
router.get("/", getDay);
router.get("/history", getHistory);
router.post("/open", requireAuth, logOpen);
router.post("/close", requireAuth, logClose);

module.exports = router;
