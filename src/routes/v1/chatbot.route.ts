import { Router } from "express";
import {
  handleChat,
  getChatHistory,
  getAllChatsHandler,
  getChatByIdHandler,
  deleteChatHandler,
} from "../../controllers/chatbot.controller";
import authMiddleware from "../../middlewares/auth.middleware";

const router = Router();

router.post("/chat", authMiddleware, handleChat);
router.get("/history", authMiddleware, getChatHistory);
router.get("/chats", authMiddleware, getAllChatsHandler);
router.get("/chats/:id", authMiddleware, getChatByIdHandler);
router.delete("/chats/:id", authMiddleware, deleteChatHandler);
export default router;
