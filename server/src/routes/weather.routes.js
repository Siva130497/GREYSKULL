const router = require("express").Router();
const { getShellWeather } = require("../controllers/weather.controller");

router.get("/", getShellWeather);

module.exports = router;