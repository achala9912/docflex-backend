import { Router } from "express";
import * as dashboardController from "../../controllers/dashboard.controller";
import authMiddleware from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, dashboardController.getDashboardMetrics);

export default router;
