// // middlewares/auth.middleware.ts
// import { Request, Response, NextFunction } from 'express';
// import { verifyToken } from '../utils/jwt';

// const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
//     if (!token) throw new Error('Authentication failed');

//     const decoded = verifyToken(token);
//     req.tokenData = decoded;
//     next();
//   } catch (error) {
//     res.status(401).send({ error: 'Please authenticate' });
//   }
// };

// export default authMiddleware;

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import Role from "../models/role.model";
import { PERMISSIONS } from "../constants/permissions.constants";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Temporary development bypass - REMOVE IN PRODUCTION
  if (
    process.env.NODE_ENV !== "production" &&
    req.path === "/api/v1/roles" &&
    req.method === "POST"
  ) {
    return next();
  }

  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Authentication failed");

    const decoded = verifyToken(token);
    req.tokenData = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Please authenticate",
      error: error instanceof Error ? error.message : "Authentication error",
    });
  }
};

export default authMiddleware;
