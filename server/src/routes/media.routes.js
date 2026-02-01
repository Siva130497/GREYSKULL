const router = require("express").Router();
const { listMedia, createMedia } = require("../controllers/media.controller");

// keep create open for now; later we can protect it
router.get("/", listMedia);
router.post("/", createMedia);

module.exports = router;