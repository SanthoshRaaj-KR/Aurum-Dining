import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import initializeTables from './src/utils/initialize.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB().then(() => {
  initializeTables();
});

// Import models after connection
let Table, Reservation;

const initModels = async () => {
  const tableModule = await import('./src/models/table.js');
  const reservationModule = await import('./src/models/reservation.js');
  Table = tableModule.default;
  Reservation = reservationModule.default;
};

// Initialize models
initModels();

// Basic routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', port: PORT });
});

// Tables routes
app.get('/tables', async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/tables', async (req, res) => {
  try {
    const { tableNumber, capacity, status, position } = req.body;
    const table = new Table({ tableNumber, capacity, status, position });
    await table.save();
    res.status(201).json(table);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reserved tables route
app.get('/reserved-tables', async (req, res) => {
  try {
    const { date, time } = req.query;
    
    if (!date || !time) {
      return res.status(400).json({ message: "Date and time required" });
    }

    const reservations = await Reservation.find({
      date: date,
      time: time,
      status: 'active'
    });

    const reservedTables = [];
    reservations.forEach(reservation => {
      reservedTables.push(...reservation.tables);
    });

    res.json([...new Set(reservedTables)]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reserve route
app.post('/reserve', async (req, res) => {
  try {
    const { fullName, phone, email, guests, date, time, tables } = req.body;

    if (!fullName || !phone || !email || !guests || !date || !time || !tables) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check availability
    const existingReservations = await Reservation.find({
      date, time, status: 'active',
      tables: { $in: tables }
    });

    if (existingReservations.length > 0) {
      return res.status(400).json({ message: "Tables already reserved" });
    }

    const orderId = 'RES-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    const reservation = new Reservation({
      orderId, fullName, phone, email,
      guests: parseInt(guests), date, time, tables
    });

    await reservation.save();

    res.status(201).json({
      message: 'Reservation created',
      orderId,
      reservation: { orderId, fullName, phone, email, guests, date, time, tables }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
app.get('/admin/tables', async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/admin/tables', async (req, res) => {
  try {
    const { tableNumber, capacity, position } = req.body;
    
    const existing = await Table.findOne({ tableNumber });
    if (existing) return res.status(400).json({ message: "Table exists" });

    const table = new Table({ tableNumber, capacity, position });
    await table.save();
    res.status(201).json({ message: "Table added", table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/admin/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/admin/takeaway-orders', (req, res) => {
  res.json([]);
});

// User routes
app.get('/user/tables', async (req, res) => {
  try {
    const tables = await Table.find({ 
      status: { $in: ["available", "reserved"] } 
    }).sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Parameterized routes (put these last)
app.put('/admin/tables/:tableNumber/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { tableNumber } = req.params;

    const table = await Table.findOneAndUpdate(
      { tableNumber: parseInt(tableNumber) },
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!table) return res.status(404).json({ message: "Table not found" });
    res.json({ message: "Status updated", table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/admin/tables/:tableNumber', async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const table = await Table.findOneAndDelete({ 
      tableNumber: parseInt(tableNumber) 
    });
    
    if (!table) return res.status(404).json({ message: "Table not found" });
    res.json({ message: "Table deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/reservation/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const reservation = await Reservation.findOne({ orderId });
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json({ message: "Reservation cancelled", orderId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
});