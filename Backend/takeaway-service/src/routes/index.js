// Backend/table-service/src/routes/index.js - Updated with takeaway routes
import express from 'express';
import Table from '../models/table.js';
import Reservation from '../models/reservation.js';
import TakeawayOrder from '../models/takeawayOrder.js';

const router = express.Router();

// Table routes
router.get('/tables', async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tables', async (req, res) => {
  const { tableNumber, capacity, status, position } = req.body;
  try {
    const table = new Table({ tableNumber, capacity, status, position });
    await table.save();
    res.status(201).json(table);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin table routes
router.get('/admin/tables', async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tables", error });
  }
});

router.post('/admin/tables', async (req, res) => {
  const { tableNumber, capacity, position } = req.body;
  if (!tableNumber || !capacity || !position) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existing = await Table.findOne({ tableNumber });
    if (existing) return res.status(400).json({ message: "Table number exists" });

    const table = new Table({ tableNumber, capacity, position });
    await table.save();
    res.status(201).json({ message: "Table added", table });
  } catch (error) {
    res.status(500).json({ message: "Error adding table", error });
  }
});

router.put('/admin/tables/:tableNumber/status', async (req, res) => {
  const { status } = req.body;
  const { tableNumber } = req.params;

  if (!["available", "reserved", "maintenance"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const table = await Table.findOneAndUpdate(
      { tableNumber: parseInt(tableNumber) },
      {
        status,
        updatedAt: Date.now(),
        ...(status === "available" ? { reservedBy: null } : {})
      },
      { new: true }
    );

    if (!table) return res.status(404).json({ message: "Table not found" });
    res.json({ message: "Status updated", table });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
});

router.delete('/admin/tables/:tableNumber', async (req, res) => {
  const { tableNumber } = req.params;

  try {
    const table = await Table.findOneAndDelete({ tableNumber: parseInt(tableNumber) });
    if (!table) return res.status(404).json({ message: "Table not found" });
    res.json({ message: "Table deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting table", error });
  }
});

// User table routes
router.get('/users/tables', async (req, res) => {
  try {
    const tables = await Table.find({ status: { $in: ["available", "reserved"] } }).sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tables", error });
  }
});

// Reservation routes
router.get('/reserved-tables', async (req, res) => {
  try {
    const { date, time } = req.query;
    
    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    const reservations = await Reservation.find({
      date: date,
      time: time,
      status: 'active'
    });

    const reservedTableNumbers = [];
    reservations.forEach(reservation => {
      reservedTableNumbers.push(...reservation.tables);
    });

    const uniqueReservedTables = [...new Set(reservedTableNumbers)];
    res.json(uniqueReservedTables);
  } catch (error) {
    console.error('Error fetching reserved tables:', error);
    res.status(500).json({ message: "Error fetching reserved tables", error: error.message });
  }
});

router.post('/reserve', async (req, res) => {
  try {
    const { userId, fullName, phone, email, guests, date, time, tables } = req.body;

    if (!userId || !fullName || !phone || !email || !guests || !date || !time || !tables || tables.length === 0) {
      return res.status(400).json({ message: "All fields including userId are required" });
    }

    const existingReservations = await Reservation.find({
      date: date,
      time: time,
      status: 'active',
      tables: { $in: tables }
    });

    if (existingReservations.length > 0) {
      return res.status(400).json({ 
        message: "Some selected tables are already reserved for this time slot" 
      });
    }

    const orderId = 'RES-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const reservation = new Reservation({
      orderId,
      userId,
      fullName,
      phone,
      email,
      guests: parseInt(guests),
      date,
      time,
      tables
    });

    await reservation.save();

    await Table.updateMany(
      { tableNumber: { $in: tables.map(t => parseInt(t)) } },
      { 
        status: 'reserved',
        reservedBy: orderId,
        updatedAt: Date.now()
      }
    );

    res.status(201).json({
      message: 'Reservation created successfully',
      orderId,
      reservation: {
        orderId,
        userId,
        fullName,
        phone,
        email,
        guests,
        date,
        time,
        tables
      }
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: "Error creating reservation", error: error.message });
  }
});

// Get all reservations (for admin only)
router.get('/admin/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reservations", error: error.message });
  }
});

router.get('/user/:user_id/reservations', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const reservations = await Reservation.find({ userId: user_id })
      .sort({ createdAt: -1 });
    
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ message: "Error fetching user reservations", error: error.message });
  }
});

router.get('/reservation/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const reservation = await Reservation.findOne({ orderId });
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    
    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ message: "Error fetching reservation", error: error.message });
  }
});

router.delete('/reservation/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const reservation = await Reservation.findOne({ orderId });
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    reservation.status = 'cancelled';
    reservation.updatedAt = Date.now();
    await reservation.save();

    await Table.updateMany(
      { 
        tableNumber: { $in: reservation.tables.map(t => parseInt(t)) },
        reservedBy: orderId
      },
      { 
        status: 'available',
        reservedBy: null,
        updatedAt: Date.now()
      }
    );

    res.json({ 
      message: "Reservation cancelled successfully",
      orderId
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: "Error deleting reservation", error: error.message });
  }
});

// ========== TAKEAWAY ORDER ROUTES ==========

// Create new takeaway order
router.post('/takeaway', async (req, res) => {
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

    // Calculate estimated delivery time (45 minutes from now)
    const estimatedDeliveryTime = new Date(Date.now() + 45 * 60 * 1000);

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
    res.status(500).json({ 
      message: "Error creating takeaway order", 
      error: error.message 
    });
  }
});

// Get takeaway order by order ID
router.get('/takeaway/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await TakeawayOrder.findOne({ orderId });
    
    if (order) {
      // Return the structured data for the new format
      return res.json({
        orderId: order.orderId,
        userId: order.userId,
        fullName: order.fullName,
        phone: order.phone,
        address: order.address,
        items: order.items,
        subtotal: order.billing.subtotal,
        tax: order.billing.tax,
        acTax: order.billing.acTax,
        gst: order.billing.gst,
        deliveryCharge: order.billing.deliveryCharge,
        total: order.billing.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        actualDeliveryTime: order.actualDeliveryTime,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      });
    }
    
    return res.status(404).json({ message: "Takeaway order not found" });
  } catch (error) {
    console.error('Error fetching takeaway order:', error);
    res.status(500).json({ 
      message: "Error fetching takeaway order", 
      error: error.message 
    });
  }
});

// Get takeaway orders by user ID
router.get('/user/:userId/takeaway-orders', async (req, res) => {
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
});

// Get all takeaway orders (for admin)
router.get('/admin/takeaway-orders', async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
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
});

// Update takeaway order status (admin only)
router.put('/admin/takeaway/:orderId/status', async (req, res) => {
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
      updateData.paymentStatus = 'paid';
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
});

// Cancel takeaway order
router.delete('/takeaway/:orderId', async (req, res) => {
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
});

// Update takeaway order details (before preparation starts)
router.put('/takeaway/:orderId', async (req, res) => {
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
});

// Get takeaway order statistics (for admin dashboard)
router.get('/admin/takeaway-stats', async (req, res) => {
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
});