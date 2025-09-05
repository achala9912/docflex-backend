import { Request, Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service";

export const getDashboardMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const centerId = req.query.centerId?.toString();
    if (!centerId) {
      res.status(400).json({ success: false, message: "centerId query parameter is required" });
      return;
    }

    const metrics = await dashboardService.getDashboardMetrics(centerId);

    res.status(200).json({
      success: true,
      data: metrics,
      message: "Dashboard metrics fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};
