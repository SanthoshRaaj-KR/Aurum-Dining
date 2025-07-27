// Backend/takeaway-service/src/routes/takeawayRoutes.js
import express from "express";
import {
  createTakeawayOrder,
  getTakeawayOrderById,
  getTakeawayOrdersByUserId,
  getAllTakeawayOrders,
  updateTakeawayOrderStatus,
  cancelTakeawayOrder,
  updateTakeawayOrder,
  getTakeawayOrderStats
} from "../controllers/takeawayController.js";

const router = express.Router();

// Create new takeaway order
router.post("/", createTakeawayOrder);

// Get takeaway orders by user ID (must come before /:orderId to avoid conflicts)
router.get("/user/:userId", getTakeawayOrdersByUserId);

// Admin routes (should add admin auth middleware)
// Get all takeaway orders with pagination and filtering
router.get("/admin/orders", getAllTakeawayOrders);

// Get takeaway order statistics
router.get("/admin/stats", getTakeawayOrderStats);

// Update takeaway order status
router.put("/admin/:orderId/status", updateTakeawayOrderStatus);

// Get takeaway order by order ID (must come after specific routes)
router.get("/:orderId", getTakeawayOrderById);

// User routes (should add user auth middleware to verify user owns the order)
// Update takeaway order details (only if not yet being prepared)
router.put("/:orderId", updateTakeawayOrder);

// Cancel takeaway order
router.delete("/:orderId", cancelTakeawayOrder);

export default router;