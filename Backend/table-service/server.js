import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import initializeTables from "./src/utils/initialize.js";
import routes from "./src/routes/index.js"; 

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

// Use your imported routes
app.use("/", routes); // ONLY THIS LINE should register your application routes

// Health check endpoint (can be here or in routes/index.js)
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Table service is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Table service running on port ${PORT}`);
});

// Export default app only if another file needs to import it for testing, etc.
// export default app; // This line is optional and depends on your project structure