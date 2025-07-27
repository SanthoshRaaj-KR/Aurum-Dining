import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import helmet from "helmet"
import authRoutes from "./src/routes/auth.routes.js";
import { connectDB } from "./src/config/db.js";
import "./src/config/passport.js";

dotenv.config();
connectDB();

const app = express();


app.use(cors({
  origin: [
    "http://localhost:5000", 
    "http://localhost:5173", // Vite default port
    "https://accounts.google.com" // Allow Google OAuth
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json());

app.use(helmet({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
}))

app.use(session({
  secret: "random",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ ROUTES
app.use("/api/auth", authRoutes);

// ✅ START SERVER
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
