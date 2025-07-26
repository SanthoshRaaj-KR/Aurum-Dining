import express from "express";
import Table from "../models/table.js";

const router = express.Router();

router.post("/sync", async (req, res) => {
  try {
    const { reservedTableNumbers = [] } = req.body;
    const reservedNums = reservedTableNumbers.map(n => parseInt(n));

    await Table.updateMany(
      { tableNumber: { $in: reservedNums } },
      { status: "reserved" }
    );

    await Table.updateMany(
      {
        tableNumber: { $nin: reservedNums },
        status: "reserved"
      },
      { status: "available", reservedBy: null }
    );

    res.json({ message: "Table statuses synced" });
  } catch (error) {
    res.status(500).json({ message: "Error syncing tables", error });
  }
});

export default router;
