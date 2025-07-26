import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  capacity: {
    type: Number,
    required: true,
    enum: [2, 4, 6, 8],
  },
  status: {
    type: String,
    enum: ["available", "reserved"],
    default: "available",
  },
});

export default mongoose.model("Table", tableSchema);
