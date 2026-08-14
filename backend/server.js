require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const bcrypt = require("bcryptjs");
const compression = require("compression");

const User = require("./models/User");
const resumeRoutes = require("./routes/resume");
const analyzeRoutes = require("./routes/analyze");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const { globalLimiter, analyzeLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const sanitizeInput = require("./middleware/sanitizeInput");
const AppError = require("./utils/AppError");

const app = express();
const server = http.createServer(app);

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
];
const envOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsersMap = new Map();

io.on("connection", (socket) => {
  socket.on("join-admin", () => {
    socket.join("admin_room");
  });

  socket.on("user-connected", async (userId) => {
    if (!userId) return;
    socket.userId = String(userId);
    
    if (!onlineUsersMap.has(socket.userId)) {
      onlineUsersMap.set(socket.userId, new Set());
    }
    onlineUsersMap.get(socket.userId).add(socket.id);

    try {
      const now = new Date();
      await User.findByIdAndUpdate(socket.userId, { isOnline: true, lastActiveAt: now });
      io.to("admin_room").emit("user_status_change", { userId: socket.userId, isOnline: true, lastActiveAt: now });
    } catch (e) {
      console.error("Socket status update error:", e.message);
    }
  });

  socket.on("disconnect", async () => {
    if (socket.userId && onlineUsersMap.has(socket.userId)) {
      const userSockets = onlineUsersMap.get(socket.userId);
      userSockets.delete(socket.id);
      
      if (userSockets.size === 0) {
        onlineUsersMap.delete(socket.userId);
        try {
          const now = new Date();
          await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastActiveAt: now });
          io.to("admin_room").emit("user_status_change", { userId: socket.userId, isOnline: false, lastActiveAt: now });
        } catch (e) {
          console.error("Socket disconnect update error:", e.message);
        }
      }
    }
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(compression());
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
app.use("/api/admin", adminRoutes);

app.get("/api/system/public-config", async (req, res) => {
  try {
    const SystemConfig = require("./models/SystemConfig");
    let config = await SystemConfig.findOne({ key: "global_settings" });
    if (!config) {
      config = { maintenanceMode: false, maintenanceNotice: "Platform is under maintenance." };
    }
    res.json({
      success: true,
      maintenanceMode: config.maintenanceMode || false,
      maintenanceNotice: config.maintenanceNotice || "Platform is under maintenance.",
      pricePerCreditInr: config.pricePerCreditInr !== undefined ? config.pricePerCreditInr : 2,
      creditCostAnalyze: config.creditCostAnalyze !== undefined ? config.creditCostAnalyze : 1,
      creditCostBuild: config.creditCostBuild !== undefined ? config.creditCostBuild : 1,
      dailyBonusCredits: config.dailyBonusCredits !== undefined ? config.dailyBonusCredits : 10,
      proPlanPrice: config.proPlanPrice !== undefined ? config.proPlanPrice : 499,
      enterprisePlanPrice: config.enterprisePlanPrice !== undefined ? config.enterprisePlanPrice : 1999,
      paymentGateway: config.paymentGateway || "razorpay",
      razorpayKeyId: config.razorpayKeyId || process.env.RAZORPAY_KEY_ID || "",
      stripePublishableKey: config.stripePublishableKey || process.env.STRIPE_PUBLISHABLE_KEY || "",
      featureFlags: config.featureFlags || {},
    });
  } catch (err) {
    res.json({
      success: true,
      maintenanceMode: false,
      maintenanceNotice: "",
      pricePerCreditInr: 2,
      proPlanPrice: 499,
      enterprisePlanPrice: 1999,
      creditCostAnalyze: 1,
      creditCostBuild: 1,
      dailyBonusCredits: 10,
      paymentGateway: "razorpay",
      razorpayKeyId: "",
      stripePublishableKey: "",
    });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Resume AI backend is running with WebSockets." });
});

app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function autoSeedAdmin() {
  try {
    const email = "admin@resumeai.com";
    const hashedPassword = await bcrypt.hash("admin123", 10);
    let adminUser = await User.findOne({ email });

    if (adminUser) {
      adminUser.password = hashedPassword;
      adminUser.role = "admin";
      adminUser.isVerified = true;
      adminUser.status = "active";
      await adminUser.save();
      console.log("Admin account synced: admin@resumeai.com / admin123");
    } else {
      await User.create({
        name: "System Admin",
        email,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        status: "active",
        subscription: "enterprise",
        aiCredits: 9999,
      });
      console.log("Seeded default Admin user: admin@resumeai.com / admin123");
    }
  } catch (err) {
    console.error("Admin auto-seed error:", err.message);
  }
}

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resume_ai")
  .then(async () => {
    console.log("MongoDB connected");
    await autoSeedAdmin();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT} (no DB connection)`)
    );
  });
