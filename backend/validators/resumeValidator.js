const { z } = require("zod");

const experienceItemSchema = z.object({
  company: z.string().trim().optional().nullable(),
  role: z.string().trim().optional().nullable(),
  duration: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
}).passthrough();

const educationItemSchema = z.object({
  school: z.string().trim().optional().nullable(),
  degree: z.string().trim().optional().nullable(),
  year: z.string().trim().optional().nullable(),
}).passthrough();

const projectItemSchema = z.object({
  name: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  techStack: z.string().trim().optional().nullable(),
  link: z.string().trim().optional().nullable(),
}).passthrough();

const resumeSchema = z.object({
  userName: z.string({ required_error: "User name is required" }).trim().min(1, "Name is required"),
  email: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  linkedin: z.string().trim().optional().nullable(),
  github: z.string().trim().optional().nullable(),
  summary: z.string().trim().optional().nullable(),
  skills: z.array(z.string().trim()).optional().nullable(),
  experience: z.array(experienceItemSchema).optional().nullable(),
  education: z.array(educationItemSchema).optional().nullable(),
  projects: z.array(projectItemSchema).optional().nullable(),
  extra: z.string().trim().optional().nullable(),
}).passthrough();

const resumeUpdateSchema = resumeSchema.partial();

module.exports = { resumeSchema, resumeUpdateSchema };
