import express from "express";
import Table from "../models/table.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tables", error });
  }
});

router.post("/", async (req, res) => {
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

router.put("/:tableNumber/status", async (req, res) => {
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

router.delete("/:tableNumber", async (req, res) => {
  const { tableNumber } = req.params;

  try {
    const table = await Table.findOneAndDelete({ tableNumber: parseInt(tableNumber) });
    if (!table) return res.status(404).json({ message: "Table not found" });
    res.json({ message: "Table deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting table", error });
  }
});

export default router;
