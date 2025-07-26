import express from "express";
import { login, signup, refresh ,googleAuth } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/google-auth", googleAuth);

export default router;
