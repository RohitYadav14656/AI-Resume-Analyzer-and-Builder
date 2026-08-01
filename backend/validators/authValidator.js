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
  .strip();

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
  .strip();

const forgotPasswordSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),
  })
  .strip();

const resetPasswordSchema = z
  .object({
    token: z
      .string({ required_error: "Reset token is required" })
      .min(1, "Reset token is required"),

    password: z
      .string({ required_error: "New password is required" })
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password must be at most 128 characters"),
  })
  .strip();

// Google OAuth — frontend sends the access token received from Google
const googleAuthSchema = z
  .object({
    accessToken: z
      .string({ required_error: "Google access token is required" })
      .min(1, "Google access token is required"),
  })
  .strip();

// Resend verification email
const resendVerificationSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),
  })
  .strip();

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
  resendVerificationSchema,
};
