const { z } = require("zod");

const suggestSchema = z.object({
  field: z.enum(["summary", "experience", "project", "skills", "extra"], {
    errorMap: () => ({ message: "Invalid field name. Must be 'summary', 'experience', 'project', 'skills', or 'extra'." }),
  }),
  currentText: z.string().trim().max(5000, "Current text too long").optional(),
  role: z.string().trim().max(200, "Role name too long").optional(),
  skills: z.string().trim().max(1000, "Skills string too long").optional(),
}).strip();

const fixGrammarSchema = z.object({
  text: z
    .string({ required_error: "Text parameter is required." })
    .trim()
    .min(1, "Text parameter cannot be empty.")
    .max(10000, "Text payload too long (max 10,000 characters)."),
}).strip();

const suggestJobDescSchema = z.object({
  role: z.string().trim().max(200, "Target role too long").optional(),
}).strip();

const checkGrammarSchema = z.object({
  text: z.string().trim().max(10000).optional(),
  resumeData: z.record(z.unknown()).optional(),
}).strip().refine((data) => data.text || data.resumeData, {
  message: "Please provide text or resumeData to check grammar.",
});

const tailorSchema = z.object({
  resume: z.union([z.record(z.unknown()), z.string().min(10)]),
  jobDescription: z
    .string({ required_error: "Job description is required." })
    .trim()
    .min(5, "Please provide a valid job description.")
    .max(10000, "Job description too long (max 10,000 characters)."),
}).strip();

module.exports = {
  suggestSchema,
  fixGrammarSchema,
  suggestJobDescSchema,
  checkGrammarSchema,
  tailorSchema,
};
