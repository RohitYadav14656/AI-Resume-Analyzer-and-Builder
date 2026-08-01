/**
 * AppError — throw this for intentional, user-facing errors inside route handlers.
 *
 * Usage:
 *   throw new AppError("Resume not found.", 404);
 *   throw new AppError("You are not authorised to do this.", 403);
 *
 * The global error handler will forward `message` directly to the client
 * because isOperational = true marks it as a safe, known error.
 */
class AppError extends Error {
  /**
   * @param {string} message  - User-facing error message (keep it friendly).
   * @param {number} status   - HTTP status code (default 400).
   */
  constructor(message, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.isOperational = true; // tells errorHandler it's safe to forward the message

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

module.exports = AppError;
