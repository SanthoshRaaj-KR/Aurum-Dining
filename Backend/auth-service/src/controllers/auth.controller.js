import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library";
import { sendTokens } from "../utils/sendTokens.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

let refreshTokens = []; // in-memory for dev

// ✅ Unified Google Login / Register
export const googleAuth = async (req, res) => {
  console.log("📝 Request body:", req.body);
  console.log("📝 Google Client ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing");
  
  const { credential } = req.body;

  if (!credential) {
    console.log("❌ No credential provided");
    return res.status(400).json({ message: "Missing Google credential" });
  }

  try {
    console.log("🔍 Verifying token...");
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("✅ Token verified, payload:", payload);
    const { email, name, sub: googleId, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        profilePic: picture,
        password: "GOOGLE_AUTH", // placeholder
      });
    }

    sendTokens(user, res);
  } catch (err) {
    console.error("Google Auth error:", err.message);
    res.status(401).json({ message: "Google login/signup failed" });
  }
};

// ✅ Standard Signup
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashed, isAdmin: false });
    await user.save();

    res.status(201).json({ message: "Signup success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Standard Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    sendTokens(user, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const refresh = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ msg: "No token" });

  // Note: You should store refresh tokens in database, not in-memory array

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Invalid token" });

    try {
      // ✅ Get fresh user data from database
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ msg: "User not found" });

      const newAccessToken = generateAccessToken({ 
        id: user._id, 
        isAdmin: user.isAdmin 
      });
      
      res.json({ accessToken: newAccessToken });
    } catch (error) {
      res.status(500).json({ msg: "Server error" });
    }
  });
};

// ✅ Get Current User Info
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
