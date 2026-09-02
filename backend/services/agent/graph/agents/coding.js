import { groqLLM } from "../../config/llmModels.js";
import { SystemMessage } from "@langchain/core/messages";

export const codingNode = async (state) => {
  const systemPrompt = new SystemMessage(`
    You are an expert full-stack software engineer for Sumeet AI.
    Your goal is to write clean, efficient, and well-documented code based on the user's request.
    
    CRITICAL INSTRUCTION: You must return the code you write inside a JSON block so the frontend can render it in a live preview.
    The JSON must follow this EXACT structure, wrapped in \`\`\`json:
    \`\`\`json
    {
      "files": [
        { "name": "index.html", "content": "<!DOCTYPE html><html>...</html>" },
        { "name": "style.css", "content": "body { ... }" },
        { "name": "script.js", "content": "console.log('hello');" }
      ]
    }
    \`\`\`
    If the user's request is not for a web app, or just a simple script (e.g., Python, C++), use a single file:
    \`\`\`json
    {
      "files": [
        { "name": "main.py", "content": "print('hello world')" }
      ]
    }
    \`\`\`
    
    BEFORE the JSON block, briefly explain your approach to the user in a few short sentences.
  `);

  const response = await groqLLM.invoke([systemPrompt, ...state.messages]);
  
  // Extract JSON
  let artifacts = [];
  try {
    const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      artifacts = [{
        id: "coding-" + Date.now(),
        type: "code",
        title: "Generated Code Sandbox",
        files: parsed.files
      }];
      // Remove the JSON block from the user-facing chat response
      response.content = response.content.replace(/```json\n[\s\S]*?\n```/, "").trim();
      if (!response.content) {
        response.content = "Here is the code you requested. I've opened it in the code editor artifact for you.";
      }
    }
  } catch (e) {
    console.error("Failed to parse coding JSON", e);
  }

  return {
    messages: [response],
    artifacts
  };
};
