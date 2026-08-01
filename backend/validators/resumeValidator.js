const { z } = require("zod");

const resumeSchema = z
  .object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name too long"),

    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    phone: z
      .string()
      .trim()
      .max(20, "Phone number too long")
      .optional(),

    summary: z
      .string()
      .trim()
      .max(2000, "Summary too long")
      .optional(),

    skills: z
      .array(z.string().trim().max(100))
      .max(50, "Too many skills")
      .optional(),

    experience: z
      .array(
        z
          .object({
            company: z.string().trim().max(200).optional(),
            role: z.string().trim().max(200).optional(),
            startDate: z.string().trim().optional(),
            endDate: z.string().trim().optional(),
            description: z.string().trim().max(2000).optional(),
          })
          .strip() // drop unknown keys in nested objects too
      )
      .max(20, "Too many experience entries")
      .optional(),

    education: z
      .array(
        z
          .object({
            institution: z.string().trim().max(200).optional(),
            degree: z.string().trim().max(200).optional(),
            year: z.string().trim().optional(),
          })
          .strip() // drop unknown keys in nested objects too
      )
      .max(10, "Too many education entries")
      .optional(),
  })
  .strip(); // drop unknown top-level keys

// Allow partial updates via PUT
const resumeUpdateSchema = resumeSchema.partial();

module.exports = { resumeSchema, resumeUpdateSchema };
