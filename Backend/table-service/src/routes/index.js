// routes/index.js - Updated routes without phone search
import express from 'express';
import Table from '../models/table.js';
import Reservation from '../models/reservation.js';

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
router.get('/user/tables', async (req, res) => {
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

    // Validate required fields (now including userId)
    if (!userId || !fullName || !phone || !email || !guests || !date || !time || !tables || tables.length === 0) {
      return res.status(400).json({ message: "All fields including userId are required" });
    }

    // Check if tables are available
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

    // Generate unique order ID
    const orderId = 'RES-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create reservation
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

    // Update table statuses
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

// Get reservations by user ID (for user profile)
router.get('/user/:userId/reservations', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const reservations = await Reservation.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ message: "Error fetching user reservations", error: error.message });
  }
});

// Get reservation by order ID
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

router.get('/admin/takeaway-orders', (req, res) => {
  // Placeholder for takeaway orders
  res.json([]);
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

    // Free up the reserved tables
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

export default router;