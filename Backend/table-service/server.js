import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import initializeTables from "./src/utils/initialize.js";

import adminRoutes from "./src/routes/adminRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import reservationSync from "./src/routes/reservationSync.js";

const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());

app.use("/admin/tables", adminRoutes);
app.use("/tables", userRoutes);
app.use("/reserved-tables", reservationSync);

connectDB().then(() => initializeTables());

app.listen(PORT, () => {
  console.log(`Table Service running on port ${PORT}`);
});
