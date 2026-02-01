const router = require("express").Router();
const { listStaffByShell } = require("../controllers/staff.controller");

router.get("/by-shell/:shellId", listStaffByShell);

module.exports = router;