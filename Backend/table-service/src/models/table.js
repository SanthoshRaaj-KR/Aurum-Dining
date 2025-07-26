import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true, enum: [2, 3, 4, 5, 6] },
  status: { type: String, enum: ["available", "reserved", "maintenance"], default: "available" },
  reservedBy: { type: String, default: null },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Table = mongoose.model("Table", tableSchema);
export default Table;
