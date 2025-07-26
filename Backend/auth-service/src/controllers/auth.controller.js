import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {OAuth2Client}  from "google-auth-library";
import { sendTokens } from "../utils/sendTokens.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

let refreshTokens = []; // In-memory, for dev only

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    // Step 1: Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Step 2: Check if user exists, else create
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: "GOOGLE_AUTH", // dummy password or flag
      });
    }

    // Step 3: Send tokens using your utility
    sendTokens(user, res);

  } catch (err) {
    console.error("Google Auth error:", err);
    res.status(401).json({ message: "Google signup/login failed" });
  }
};



export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashed, isAdmin: false }); // default: false
    await user.save();

    res.status(201).json({ message: "Signup success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const refresh = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ msg: "No token" });

  if (!refreshTokens.includes(token))
    return res.status(403).json({ msg: "Invalid refresh token" });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ msg: "Invalid token" });

    const newAccessToken = generateAccessToken({ _id: user.id, isAdmin: user.isAdmin });
    res.json({ accessToken: newAccessToken });
  });
};
