import { Request, Response } from "express";
import {
  getRAGAnswer,
  getChatById,
  getChatsByUserId,
  deleteChat,
  deleteAllChatsByUserId,
} from "../services/chatbot.service";
import ChatHistory from "../models/chatHistory.model";

export const handleChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { question } = req.body;
  const userId = (req as any).tokenData?.userId;

  if (!question || !userId) {
    res
      .status(400)
      .json({ success: false, message: "Question and User ID are required" });
    return;
  }

  try {
    const answer = await getRAGAnswer(question);

    await ChatHistory.findOneAndUpdate(
      { userId },
      {
        $push: {
          messages: [
            { role: "user", content: question },
            { role: "assistant", content: answer },
          ],
        },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, answer });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process request.",
    });
  }
};

export const getChatHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).tokenData?.userId;
  if (!userId) {
    res.status(400).json({ success: false, message: "User ID is required" });
    return;
  }

  try {
    const history = await ChatHistory.findOne({ userId });
    res.status(200).json({
      success: true,
      data: history ? history.messages : [],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve chat history.",
    });
  }
};

export const getAllChatsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).tokenData?.userId;

  if (!userId) {
    res.status(400).json({ success: false, message: "User ID is required" });
    return;
  }

  try {
    const chats = await getChatsByUserId(userId);
    res.status(200).json({ success: true, data: chats });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get chats.",
    });
  }
};

export const getChatByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const chat = await getChatById(id);
    if (!chat) {
      res.status(404).json({ success: false, message: "Chat not found" });
      return;
    }
    res.status(200).json({ success: true, data: chat });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get chat.",
    });
  }
};

export const deleteChatHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const chat = await deleteChat(id);
    if (!chat) {
      res.status(404).json({ success: false, message: "Chat not found" });
      return;
    }
    res
      .status(200)
      .json({ success: true, message: "Chat deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete chat.",
    });
  }
};

export const deleteAllChatsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).tokenData?.userId;

  if (!userId) {
    res.status(400).json({ success: false, message: "User ID is required" });
    return;
  }

  try {
    const result = await deleteAllChatsByUserId(userId);
    if (!result.deletedCount) {
      res.status(404).json({ success: false, message: "No chats found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "All chats deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete all chats.",
    });
  }
};
