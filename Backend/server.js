import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import initializeTables from "./src/utils/initialize.js";

// Import route handlers
import mainRoutes from "./src/routes/index.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import reservationSyncRoutes from "./src/routes/reservationSync.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database and initialize tables
connectDB().then(() => {
  initializeTables();
});

// Routes
app.use("/", mainRoutes);
app.use("/admin/tables", adminRoutes);
app.use("/user/tables", userRoutes);
app.use("/sync", reservationSyncRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Table service is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ 
    message: "Internal server error", 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Table service running on port ${PORT}`);
});

export default app;