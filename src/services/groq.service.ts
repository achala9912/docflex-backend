import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getAnswerFromLLM(prompt: string): Promise<string> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      // model: "moonshotai/kimi-k2-instruct",
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
    });
    return chatCompletion.choices[0]?.message?.content || "No response found.";
  } catch (error) {
    console.error("Error generating content from Groq:", error);
    throw new Error("Could not generate response from Groq.");
  }
}
