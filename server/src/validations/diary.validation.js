const { z } = require("zod");

const createDiaryEntrySchema = z.object({
  shellId: z.string().min(1),
  staffId: z.string().min(1),

  // either pick an existing type OR create new heading
  issueTypeId: z.string().optional(),
  newIssueTypeName: z.string().trim().min(2).max(60).optional(),

  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  description: z.string().trim().min(2).max(2000)
}).refine(
  (v) => Boolean(v.issueTypeId) || Boolean(v.newIssueTypeName),
  { message: "Either issueTypeId or newIssueTypeName is required" }
);

module.exports = { createDiaryEntrySchema };