import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { sendTokens } from "../utils/sendTokens.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  sendTokens(user, res);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  sendTokens(user, res);
};

// Refresh token endpoint
export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(decoded.id);
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};
