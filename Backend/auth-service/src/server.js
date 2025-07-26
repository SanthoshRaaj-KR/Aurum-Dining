import express from "express";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./config/db.js";
import "./config/passport.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(session({ secret: "random", resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
