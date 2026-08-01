const { z } = require("zod");

const registerSchema = z
  .object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),

    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password must be at most 128 characters"),
  })
  .strip(); // drop unknown keys — prevents prototype pollution

const loginSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required"),
  })
  .strip(); // drop unknown keys

module.exports = { registerSchema, loginSchema };
