const router = require("express").Router();
const { listShells } = require("../controllers/shell.controller");

router.get("/", listShells);

module.exports = router;