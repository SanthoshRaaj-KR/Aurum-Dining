import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import tableRoutes from "./routes/tableroutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());
app.use("/api/tables", tableRoutes);

app.get("/", (req, res) => res.send("🍽️ Table Service Running"));

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Table-Service running on port ${PORT}`);
  });
});
