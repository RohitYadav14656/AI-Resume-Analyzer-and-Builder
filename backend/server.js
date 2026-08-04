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
const userRoutes = require("./routes/user");
const { globalLimiter, analyzeLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const sanitizeInput = require("./middleware/sanitizeInput");
const AppError = require("./utils/AppError");

const app = express();

app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
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

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use(
  mongoSanitize({
    replaceWith: "_",
    onSanitizeHtml: () => {},
  })
);

app.use(sanitizeInput);
app.use(globalLimiter);

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

app.use("/api/resume", resumeRoutes);
app.use("/api/analyze", analyzeLimiter, analyzeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Resume AI backend is running." });
});

app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

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
