import { getAnswerFromLLM } from "./groq.service";
import { getEmbedding } from "./localEmbeddings.service";
import BNFData, { IBNFData } from "../models/bnfData.model";
import ChatHistory, { IChatHistory } from "../models/chatHistory.model";

export const getRAGAnswer = async (userQuestion: string): Promise<string> => {
  try {
    const questionEmbedding = await getEmbedding(userQuestion);
    const relevantDocs = await BNFData.aggregate<IBNFData>([
      {
        $vectorSearch: {
          queryVector: questionEmbedding,
          path: "embedding",
          numCandidates: 100,
          limit: 5,
          index: "bnf_vector_index",
        },
      },
      {
        $project: {
          _id: 0,
          text: 1,
        },
      },
    ]);
    const context = relevantDocs.map((doc) => doc.text).join("\n\n---\n\n");
    const prompt = `You are a only medical assistant. Use the following context to answer the user's question. If the answer is not in the context, state that you cannot provide an answer based on the available information.
    Context:
    ${context}
    User's question: ${userQuestion}`;
    const answer = await getAnswerFromLLM(prompt);
    return answer;
  } catch (error) {
    console.error("Error in RAG process:", error);
    throw new Error("Could not retrieve an answer.");
  }
};

export const getChatById = async (
  chatId: string
): Promise<IChatHistory | null> => {
  try {
    const chatHistory = await ChatHistory.findById(chatId).lean();
    return chatHistory;
  } catch (error) {
    console.error("Error retrieving chat by ID:", error);
    throw new Error("Could not retrieve chat history.");
  }
};

export const getChatsByUserId = async (
  userId: string
): Promise<IChatHistory[]> => {
  try {
    const chats = await ChatHistory.find({ userId }).lean();
    return chats;
  } catch (error) {
    console.error("Error retrieving chats by user ID:", error);
    throw new Error("Could not retrieve chat list.");
  }
};

export const deleteChat = async (
  chatId: string
): Promise<IChatHistory | null> => {
  try {
    const deletedChat = await ChatHistory.findByIdAndDelete(chatId).lean();
    return deletedChat;
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw new Error("Could not delete chat.");
  }
};

export const deleteAllChatsByUserId = async (
  userId: string
): Promise<{ deletedCount?: number }> => {
  try {
    const result = await ChatHistory.deleteMany({ userId });
    return result;
  } catch (error) {
    console.error("Error deleting all chats:", error);
    throw new Error("Could not delete all chats.");
  }
};
