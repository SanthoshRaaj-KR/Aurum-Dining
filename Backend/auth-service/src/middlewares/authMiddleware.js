import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      return next();
    } catch {
      return res.status(401).json({ message: "Token expired or invalid" });
    }
  }

  return res.status(401).json({ message: "No token" });
};
