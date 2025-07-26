import Reservation from "../models/reservation.js";
import Table from "../models/table.js";

// Get reserved tables for a specific date and time
export const getReservedTables = async (req, res) => {
  try {
    const { date, time } = req.query;
    
    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    // Find all active reservations for the given date and time
    const reservations = await Reservation.find({
      date: date,
      time: time,
      status: 'active'
    });

    // Extract all reserved table numbers
    const reservedTableNumbers = [];
    reservations.forEach(reservation => {
      reservedTableNumbers.push(...reservation.tables);
    });

    // Remove duplicates and return
    const uniqueReservedTables = [...new Set(reservedTableNumbers)];
    
    res.json(uniqueReservedTables);
  } catch (error) {
    console.error('Error fetching reserved tables:', error);
    res.status(500).json({ message: "Error fetching reserved tables", error: error.message });
  }
};

// Create a new reservation
export const createReservation = async (req, res) => {
  try {
    const { fullName, phone, email, guests, date, time, tables } = req.body;

    // Validate required fields
    if (!fullName || !phone || !email || !guests || !date || !time || !tables || tables.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
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

    // Verify tables exist and are available
    const tableObjects = await Table.find({
      tableNumber: { $in: tables.map(t => parseInt(t)) },
      status: { $in: ['available', 'reserved'] }
    });

    if (tableObjects.length !== tables.length) {
      return res.status(400).json({ 
        message: "Some selected tables are not available" 
      });
    }

    // Generate unique order ID
    const orderId = 'RES-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create reservation
    const reservation = new Reservation({
      orderId,
      fullName,
      phone,
      email,
      guests: parseInt(guests),
      date,
      time,
      tables
    });

    await reservation.save();

    // Update table statuses to reserved (optional, depends on your business logic)
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
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Reservation with this order ID already exists" 
      });
    }
    
    res.status(500).json({ message: "Error creating reservation", error: error.message });
  }
};

// Get all reservations (for admin)
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .sort({ createdAt: -1 });
    
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: "Error fetching reservations", error: error.message });
  }
};

// Get reservation by order ID
export const getReservationById = async (req, res) => {
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
};

// Delete/Cancel reservation
export const deleteReservation = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const reservation = await Reservation.findOne({ orderId });
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Update reservation status to cancelled
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
};

// Update reservation
export const updateReservation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updates = req.body;
    
    const reservation = await Reservation.findOne({ orderId });
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // If tables are being updated, check availability
    if (updates.tables) {
      const existingReservations = await Reservation.find({
        date: updates.date || reservation.date,
        time: updates.time || reservation.time,
        status: 'active',
        orderId: { $ne: orderId }, // Exclude current reservation
        tables: { $in: updates.tables }
      });

      if (existingReservations.length > 0) {
        return res.status(400).json({ 
          message: "Some selected tables are already reserved for this time slot" 
        });
      }
    }

    // Update reservation
    Object.keys(updates).forEach(key => {
      if (key !== 'orderId' && key !== 'createdAt') {
        reservation[key] = updates[key];
      }
    });
    
    reservation.updatedAt = Date.now();
    await reservation.save();

    res.json({
      message: "Reservation updated successfully",
      reservation
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: "Error updating reservation", error: error.message });
  }
};