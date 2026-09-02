import * as dotenv from 'dotenv';
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
const groqApiKey = process.env.GROQ_API_KEY || "";

export const groqLLM = new ChatGroq({
  apiKey: groqApiKey,
  modelName: "llama3-70b-8192", // Standard fast model on Groq
  temperature: 0.7,
});

export const geminiLLM = new ChatGoogleGenerativeAI({
  apiKey: googleApiKey,
  model: "gemini-3.5-flash",
  temperature: 0.7,
});
