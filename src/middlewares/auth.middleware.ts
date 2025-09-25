import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required: missing token",
      });
      return; 
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = verifyToken(token); 

    console.log("🔐 Decoded tokenData:", decoded);

    req.tokenData = decoded;
    next();
  } catch (error) {
    console.error("❌ Invalid or expired token:", error);
    res.status(401).json({
      success: false,
      message: "Authentication required: invalid or expired token",
    });
    return;
  }
};

export default authMiddleware;
