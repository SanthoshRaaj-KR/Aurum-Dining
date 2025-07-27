// Backend/takeaway-service/src/controllers/takeawayController.js
import TakeawayOrder from "../models/takeawayOrder.js";

// Create a new takeaway order
export const createTakeawayOrder = async (req, res) => {
  try {
    const { 
      userId, 
      fullName, 
      phone, 
      address, 
      items, 
      subtotal, 
      tax, 
      acTax, 
      gst, 
      deliveryCharge, 
      total,
      notes 
    } = req.body;

    // Validate required fields
    if (!userId || !fullName || !phone || !address || !items || items.length === 0) {
      return res.status(400).json({ 
        message: "All fields including userId are required, and at least one item must be provided" 
      });
    }

    // Validate items array
    for (const item of items) {
      if (!item.name || !item.quantity || !item.price || item.quantity <= 0 || item.price < 0) {
        return res.status(400).json({ 
          message: "Each item must have a valid name, quantity (>0), and price (>=0)" 
        });
      }
    }

    // Generate unique order ID
    const orderId = 'TAK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Calculate estimated delivery time (upto 45 minutes from now)
    const random_time = Math.floor(Math.random() * 45) + 1;

    const estimatedDeliveryTime = new Date(Date.now() + random_time * 60 * 1000);

    // Create takeaway order
    const takeawayOrder = new TakeawayOrder({
      orderId,
      userId,
      fullName,
      phone,
      address,
      items,
      billing: {
        subtotal,
        tax,
        acTax,
        gst,
        deliveryCharge,
        total
      },
      estimatedDeliveryTime,
      notes: notes || ""
    });

    await takeawayOrder.save();

    res.status(201).json({
      message: 'Takeaway order created successfully',
      orderId,
      estimatedDeliveryTime,
      order: {
        orderId,
        userId,
        fullName,
        phone,
        address,
        items,
        billing: takeawayOrder.billing,
        status: takeawayOrder.status,
        estimatedDeliveryTime,
        createdAt: takeawayOrder.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating takeaway order:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Order with this ID already exists" 
      });
    }
    
    res.status(500).json({ 
      message: "Error creating takeaway order", 
      error: error.message 
    });
  }
};

// Get takeaway order by order ID
export const getTakeawayOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await TakeawayOrder.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({ message: "Takeaway order not found" });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching takeaway order:', error);
    res.status(500).json({ 
      message: "Error fetching takeaway order", 
      error: error.message 
    });
  }
};

// Get takeaway orders by user ID
export const getTakeawayOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const orders = await TakeawayOrder.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user takeaway orders:', error);
    res.status(500).json({ 
      message: "Error fetching user takeaway orders", 
      error: error.message 
    });
  }
};

// Get all takeaway orders (for admin)
export const getAllTakeawayOrders = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await TakeawayOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const totalOrders = await TakeawayOrder.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        hasMore: skip + orders.length < totalOrders
      }
    });
  } catch (error) {
    console.error('Error fetching takeaway orders:', error);
    res.status(500).json({ 
      message: "Error fetching takeaway orders", 
      error: error.message 
    });
  }
};

// Update takeaway order status
export const updateTakeawayOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Valid statuses are: " + validStatuses.join(', ')
      });
    }
    
    const updateData = { 
      status, 
      updatedAt: Date.now() 
    };
    
    // If status is delivered, set actual delivery time
    if (status === 'delivered') {
      updateData.actualDeliveryTime = new Date();
      updateData.paymentStatus = 'paid'; // Assume payment is completed on delivery
    }
    
    // Add notes if provided
    if (notes) {
      updateData.notes = notes;
    }
    
    const order = await TakeawayOrder.findOneAndUpdate(
      { orderId },
      updateData,
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: "Takeaway order not found" });
    }
    
    res.json({
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error('Error updating takeaway order status:', error);
    res.status(500).json({ 
      message: "Error updating takeaway order status", 
      error: error.message 
    });
  }
};

// Cancel takeaway order
export const cancelTakeawayOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await TakeawayOrder.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({ message: "Takeaway order not found" });
    }
    
    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        message: `Cannot cancel order that is already ${order.status}` 
      });
    }
    
    // Update order status to cancelled
    order.status = 'cancelled';
    order.notes = reason ? `Cancelled: ${reason}` : 'Order cancelled';
    order.updatedAt = Date.now();
    
    await order.save();
    
    res.json({ 
      message: "Takeaway order cancelled successfully",
      orderId,
      order
    });
  } catch (error) {
    console.error('Error cancelling takeaway order:', error);
    res.status(500).json({ 
      message: "Error cancelling takeaway order", 
      error: error.message 
    });
  }
};

// Update takeaway order details (before preparation starts)
export const updateTakeawayOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updates = req.body;
    
    const order = await TakeawayOrder.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({ message: "Takeaway order not found" });
    }
    
    // Check if order can be updated
    if (['preparing', 'out_for_delivery', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        message: `Cannot update order that is ${order.status}` 
      });
    }
    
    // List of fields that can be updated
    const allowedUpdates = ['fullName', 'phone', 'address', 'items', 'billing', 'notes'];
    
    // Apply updates
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        order[key] = updates[key];
      }
    });
    
    order.updatedAt = Date.now();
    await order.save();
    
    res.json({
      message: "Takeaway order updated successfully",
      order
    });
  } catch (error) {
    console.error('Error updating takeaway order:', error);
    res.status(500).json({ 
      message: "Error updating takeaway order", 
      error: error.message 
    });
  }
};

// Get order statistics (for admin dashboard)
export const getTakeawayOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get various statistics
    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      confirmedOrders,
      preparingOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      todayRevenue
    ] = await Promise.all([
      TakeawayOrder.countDocuments(),
      TakeawayOrder.countDocuments({ 
        createdAt: { $gte: today, $lt: tomorrow } 
      }),
      TakeawayOrder.countDocuments({ status: 'pending' }),
      TakeawayOrder.countDocuments({ status: 'confirmed' }),
      TakeawayOrder.countDocuments({ status: 'preparing' }),
      TakeawayOrder.countDocuments({ status: 'out_for_delivery' }),
      TakeawayOrder.countDocuments({ status: 'delivered' }),
      TakeawayOrder.countDocuments({ status: 'cancelled' }),
      TakeawayOrder.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$billing.total' }
          }
        }
      ])
    ]);
    
    res.json({
      totalOrders,
      todayOrders,
      ordersByStatus: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        preparing: preparingOrders,
        out_for_delivery: outForDeliveryOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      },
      todayRevenue: todayRevenue[0]?.totalRevenue || 0
    });
  } catch (error) {
    console.error('Error fetching takeaway order stats:', error);
    res.status(500).json({ 
      message: "Error fetching takeaway order statistics", 
      error: error.message 
    });
  }
};