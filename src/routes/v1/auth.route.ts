import express from "express";
import authController from "../../controllers/auth.controller";
import authMiddleware from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/login", (req, res, next) => {
  authController.login(req, res).catch(next);
});

router.get("/me", authMiddleware, (req, res, next) => {
  authController.getCurrentUser(req, res).catch(next);
});

export default router;
