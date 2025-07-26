import express from "express";
import {
  getTables,
  addTable,
  updateStatus,
  deleteTable,
} from "../controllers/tableController.js";

const router = express.Router();

router.get("/", getTables);
router.post("/", addTable);
router.patch("/:tableId/status", updateStatus);
router.delete("/:tableId", deleteTable);

export default router;
