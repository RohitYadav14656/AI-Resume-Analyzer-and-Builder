const IS_PROD = process.env.NODE_ENV === "production";

/**
 * Map known error types to friendly messages + HTTP status codes.
 * The user NEVER sees raw error details.
 */
function classifyError(err) {
  // ── Zod validation errors (already handled in validate.js, but just in case) ──
  if (err.name === "ZodError") {
    return {
      status: 422,
      message: "Invalid input. Please check your data and try again.",
      errors: err.errors?.map((e) => ({ field: e.path.join("."), message: e.message })),
    };
  }

  // ── Mongoose CastError (e.g. invalid ObjectId) ────────────────────────────────
  if (err.name === "CastError") {
    return { status: 400, message: "Invalid ID format." };
  }

  // ── Mongoose ValidationError (schema-level) ───────────────────────────────────
  if (err.name === "ValidationError") {
    const fields = Object.keys(err.errors).join(", ");
    return { status: 422, message: `Validation failed for: ${fields}.` };
  }

  // ── Mongoose duplicate key (E11000) ───────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return {
      status: 409,
      message: `A record with that ${field} already exists.`,
    };
  }

  // ── JWT errors ────────────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    return { status: 401, message: "Invalid or missing authentication token." };
  }
  if (err.name === "TokenExpiredError") {
    return { status: 401, message: "Your session has expired. Please log in again." };
  }

  // ── CORS error ────────────────────────────────────────────────────────────────
  if (err.message && err.message.startsWith("CORS:")) {
    return { status: 403, message: "Access denied." };
  }

  // ── Rate-limit errors (express-rate-limit sets status 429 itself, but guard) ──
  if (err.status === 429) {
    return { status: 429, message: "Too many requests. Please slow down and try again later." };
  }

  // ── Payload too large ─────────────────────────────────────────────────────────
  if (err.type === "entity.too.large" || err.status === 413) {
    return { status: 413, message: "Request body is too large." };
  }

  // ── Bad JSON body ─────────────────────────────────────────────────────────────
  if (err.type === "entity.parse.failed") {
    return { status: 400, message: "Invalid JSON in request body." };
  }

  // ── Multer file-upload errors ─────────────────────────────────────────────────
  if (err.code === "LIMIT_FILE_SIZE") {
    return { status: 413, message: "Uploaded file is too large." };
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return { status: 400, message: "Unexpected file field in upload." };
  }

  // ── Explicit operational errors (e.g. thrown with new AppError()) ─────────────
  if (err.isOperational) {
    return { status: err.status || 400, message: err.message };
  }

  // ── Fallback: unknown / programmer error ──────────────────────────────────────
  return {
    status: 500,
    message: "Something went wrong. Please try again later.",
  };
}

/**
 * Global Express error-handling middleware.
 * Must have 4 parameters so Express recognises it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const { status, message, errors } = classifyError(err);

  // ── Always log the REAL error on the server ───────────────────────────────────
  // Avoid printing heavy stack traces for expected operational 401/403/404 errors
  const isExpectedClientError = status === 401 || status === 403 || status === 404;

  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${status}`,
    {
      message: err.message,
      name: err.name,
      code: err.code,
      // Only log stack in development for unexpected server errors (500+)
      ...(IS_PROD || isExpectedClientError ? {} : { stack: err.stack }),
    }
  );

  // ── Send a clean, friendly response to the client ─────────────────────────────
  const body = { success: false, message };

  // Include field-level errors only for validation failures
  if (errors) body.errors = errors;

  // In development, also include the real message to aid debugging
  if (!IS_PROD && status === 500) {
    body.debug = err.message;
  }

  res.status(status).json(body);
}

module.exports = errorHandler;
