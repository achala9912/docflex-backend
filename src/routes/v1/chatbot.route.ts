import { Router } from "express";
import {
  handleChat,
  getChatHistory,
} from "../../controllers/chatbot.controller";
import authMiddleware from "../../middlewares/auth.middleware";

const router = Router();

router.post("/chat", authMiddleware, handleChat);

router.get("/history", authMiddleware, getChatHistory);

export default router;
