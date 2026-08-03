require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const resumeRoutes = require("./routes/resume");
const analyzeRoutes = require("./routes/analyze");
const authRoutes = require("./routes/auth");
const { globalLimiter, analyzeLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const sanitizeInput = require("./middleware/sanitizeInput");
const AppError = require("./utils/AppError");

const app = express();

// ─── Security Headers (Helmet) ───────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));

// ─── Cookie Parser ────────────────────────────────────────────────────────────
// Required to read HttpOnly refresh token cookies sent by the browser
app.use(cookieParser());

// ─── NoSQL Injection Prevention ───────────────────────────────────────────────
// Strips $ and . operators from req.body, req.params, req.query.
app.use(
  mongoSanitize({
    replaceWith: "_",
    onSanitizeHtml: () => {},
  })
);

// ─── XSS & Script Tag Sanitization Middleware ───────────────────────────────
app.use(sanitizeInput);

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
app.use(globalLimiter);

// ─── Ensure uploads folder exists ─────────────────────────────────────────────
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/resume", resumeRoutes);
app.use("/api/analyze", analyzeLimiter, analyzeRoutes); // extra limit on AI endpoint
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Resume AI backend is running." });
});

// ─── 404 — Unknown routes ─────────────────────────────────────────────────────
app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// Must be registered LAST. Catches every error forwarded via next(err).
app.use(errorHandler);

// ─── DB + Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT} (no DB connection)`)
    );
  });
