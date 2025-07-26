import { generateAccessToken, generateRefreshToken } from "./generateTokens.js";

export const sendTokens = (user, res) => {
  try {
    console.log("🔄 Generating tokens for user:", user._id);
    
    const payload = { id: user._id, isAdmin: user.isAdmin };
    
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    console.log("✅ Tokens generated successfully");

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
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
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("❌ Token generation failed:", error.message);
    res.status(500).json({ 
      message: "Token generation failed", 
      error: error.message 
    });
  }
};