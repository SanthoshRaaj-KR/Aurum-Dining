import express from "express";
import Table from "../models/table.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const tables = await Table.find({ status: { $in: ["available", "reserved"] } }).sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tables", error });
  }
});

export default router;
