import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const textModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

export async function getAnswerFromLLM(prompt: string): Promise<string> {
  try {
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error("Could not generate response.");
  }
}

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent({
      content: {
        role: "user",
        parts: [{ text }],
      },
    });
    return result.embedding.values;
  } catch (error) {
    console.error("Error getting embedding from Gemini:", error);
    throw new Error("Could not create embedding.");
  }
}
