import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import takeawayRoutes from "./src/routes/takeawayRoutes.js";
import dotenv from "dotenv";

import TakeawayOrder from "./src/models/takeawayOrder.js";

dotenv.config({ silent: true });

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/takeaway", takeawayRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Takeaway service is running",
    timestamp: new Date().toISOString(),
    models: {
      takeawayOrders: "connected"
    }
  });
});

// Test endpoint to check if orders exist
app.get("/test-orders", async (req, res) => {
  try {
    const count = await TakeawayOrder.countDocuments();
    res.json({ 
      message: "Takeaway service test endpoint",
      orderCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error testing orders", 
      error: error.message 
    });
  }
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
  console.log(`🚀 Takeaway service running on port ${PORT}`);
  console.log(`💾 MongoDB connection: ${process.env.MONGO_URI ? 'Configured' : 'Not configured'}`);
  console.log(`📋 Models loaded: TakeawayOrder`);
  console.log(`🔗 API endpoints available at:`);
  console.log(`   - Takeaway orders: http://localhost:${PORT}/api/takeaway`);
  console.log(`   - Health check: http://localhost:${PORT}/health`);
});