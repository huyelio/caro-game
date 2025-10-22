/**
 * CARO GAME SERVER - MAIN ENTRY POINT
 * Express + Socket.IO + PostgreSQL
 */

require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const socketHandlers = require("./socket/socketHandlers");

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE =====

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ===== API ROUTES =====

app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/build", "index.html"));
  });
}

// ===== SOCKET.IO =====

socketHandlers(io);

// ===== ERROR HANDLING =====

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ===== START SERVER =====

server.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log("🎮 CARO GAME PLATFORM - ADVANCED VERSION 2.0");
  console.log("=".repeat(60));
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(
    `🌐 Client: ${process.env.CLIENT_URL || "http://localhost:3000"}`
  );
  console.log(`🗄️  Database: ${process.env.DB_NAME || "caro_game"}`);
  console.log(`🔌 Socket.IO: Ready`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  console.log("=".repeat(60));
  console.log("\n✨ Features:");
  console.log("   ✅ 10x10 Board");
  console.log("   ✅ 2-Player Mode");
  console.log("   ✅ 3-Player Mode");
  console.log("   ✅ vs Bot (AI)");
  console.log("   ✅ User Authentication (JWT)");
  console.log("   ✅ Game Statistics & Leaderboard");
  console.log("=".repeat(60));
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
