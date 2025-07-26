import express from "express";
import { login, signup, refresh ,googleAuth ,getMe} from "../controllers/auth.controller.js";
import { verifyAccessToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/register", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/google-auth", googleAuth);
router.get("/me", verifyAccessToken, getMe);

export default router;
