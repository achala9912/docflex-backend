import 'dotenv/config';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function listModels() {
  try {
    const models = await groq.models.list();
    console.log("Available models:", models);
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
