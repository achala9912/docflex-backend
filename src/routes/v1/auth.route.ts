import express from "express";
import authController from "../../controllers/auth.controller";
import authMiddleware from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/login", (req, res, next) => {
  authController.loginUser(req, res).catch(next);
});

router.post("/reset-first-login-password", (req, res, next) => {
  authController.resetFirstLoginPassword(req, res).catch(next);
});

router.get("/me", authMiddleware, (req, res, next) => {
  authController.getCurrentUser(req, res).catch(next);
});
router.post("/change-password", authMiddleware, (req, res, next) => {
  authController.changePassword(req, res).catch(next);
});

router.post("/forgot-password/send-otp", (req, res, next) => {
  authController.sendForgotPasswordOtp(req, res).catch(next);
});

router.post("/forgot-password/verify-otp", (req, res, next) => {
  authController.verifyOtpAndResetPassword(req, res).catch(next);
});
export default router;
