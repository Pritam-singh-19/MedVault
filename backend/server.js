const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const explainReportRoutes = require("./routes/explainReportRoutes");
const chatbotRoutes = require("./routes/chatbot");
const { connectDB, gridFSBucket } = require("./config/db");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "https://medvault19.netlify.app", // Allow only Netlify frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Request-ID'],
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));


// Connect to MongoDB and Start Server
connectDB()
  .then(() => {
    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/profile", profileRoutes);
    app.use("/api/upload", uploadRoutes);
    app.use("/api", explainReportRoutes);
    app.use("/api", chatbotRoutes);
    app.use("/api/reminders", require("./routes/reminderRoutes"));
    
    // Log all upload API requests
    app.use("/api/upload", (req, res, next) => {
      console.log(`📩 API Hit: ${req.method} ${req.originalUrl}`);
      next();
    });



    // Root Route
    app.get("/", (req, res) => {
      res.send("🚀 API is running...");
    });

    // Start Server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err);
  });
