const { z } = require("zod");

const createIssueTypeSchema = z.object({
  shellId: z.string().min(1),
  staffId: z.string().min(1),
  name: z.string().trim().min(2).max(60)
});

module.exports = { createIssueTypeSchema };