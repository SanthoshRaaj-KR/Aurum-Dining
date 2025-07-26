import Table from "../models/table.js";

// Get all tables
export const getTables = async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a table
export const addTable = async (req, res) => {
  const { tableNumber, capacity, status } = req.body;

  try {
    const table = new Table({ tableNumber, capacity, status });
    await table.save();
    res.status(201).json(table);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update table status
export const updateStatus = async (req, res) => {
  const { tableId } = req.params;
  const { status } = req.body;

  try {
    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: "Table not found" });

    table.status = status;
    await table.save();
    res.json(table);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete table
export const deleteTable = async (req, res) => {
  const { tableId } = req.params;

  try {
    const table = await Table.findByIdAndDelete(tableId);
    if (!table) return res.status(404).json({ message: "Table not found" });

    res.json({ message: "Table deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
