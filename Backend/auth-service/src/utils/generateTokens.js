import jwt from "jsonwebtoken";
export const generateAccessToken = (payload) => {
  console.log("🔑 ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET ? "✅ Set" : "❌ Missing");
  
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  });
};

export const generateRefreshToken = (payload) => {
  console.log("🔑 JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET ? "✅ Set" : "❌ Missing");
  
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  });
};