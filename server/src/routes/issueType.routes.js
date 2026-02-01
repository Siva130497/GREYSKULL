const router = require("express").Router();
const { listIssueTypes, createIssueType } = require("../controllers/issueType.controller");
const { validateBody } = require("../middlewares/validate.middleware");
const { createIssueTypeSchema } = require("../validations/issueType.validation");

router.get("/", listIssueTypes);
router.post("/", validateBody(createIssueTypeSchema), createIssueType);

module.exports = router;