import { generateAccessToken, generateRefreshToken } from "./generateTokens.js";

export const sendTokens = (user, res) => {
  const accessToken = generateAccessToken({ id: user._id, isAdmin: user.isAdmin });
  const refreshToken = generateRefreshToken({ id: user._id, isAdmin: user.isAdmin });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
    sameSite: "Lax", // Allows cross-site cookie for top-level nav
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  res.status(200).json({
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  });
};
