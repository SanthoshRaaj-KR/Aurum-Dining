// Backend/table-service/server.js - Updated to include takeaway model
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import initializeTables from "./src/utils/initialize.js";
import routes from "./src/routes/index.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import reservationSyncRoutes from "./src/routes/reservationSync.js";
import takeawayRoutes from "./src/routes/takeawayRoutes.js"; 
import dotenv from "dotenv";

// Import models to ensure they are registered with mongoose
import Table from "./src/models/table.js";
import Reservation from "./src/models/reservation.js";
import TakeawayOrder from "./src/models/takeawayOrder.js"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Initialize default tables
initializeTables();

// Routes
app.use("/api", routes);                    // Main routes (includes takeaway routes now)
app.use("/api/admin/tables", adminRoutes);  // Admin table management
app.use("/api/user/tables", userRoutes);    // User table viewing
app.use("/api/sync", reservationSyncRoutes); // Table sync routes
app.use("/api/takeaway", takeawayRoutes);   // Dedicated takeaway routes

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Table service is running",
    timestamp: new Date().toISOString(),
    models: {
      tables: "connected",
      reservations: "connected", 
      takeawayOrders: "connected"
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ 
    message: "Something went wrong!", 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Table service running on port ${PORT}`);
  console.log(`💾 MongoDB connection: ${process.env.MONGO_URI ? 'Configured' : 'Not configured'}`);
  console.log(`📋 Models loaded: Table, Reservation, TakeawayOrder`);
  console.log(`🔗 API endpoints available at:`);
  console.log(`   - Main routes: http://localhost:${PORT}/api`);
  console.log(`   - Admin tables: http://localhost:${PORT}/api/admin/tables`);
  console.log(`   - User tables: http://localhost:${PORT}/api/user/tables`);
  console.log(`   - Takeaway orders: http://localhost:${PORT}/api/takeaway`);
  console.log(`   - Health check: http://localhost:${PORT}/health`);
});