import { groqLLM } from "../../config/llmModels.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export const routerNode = async (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  
  // Ask the LLM to classify intent
  const systemPrompt = new SystemMessage(`
    You are an expert intent classifier for Sumeet AI.
    Analyze the user's input and classify it into EXACTLY ONE of these intents:
    - 'coding': Requests to write code, build web apps, UI components, games, or scripts.
    - 'search': Requests requiring up-to-date real-time internet information or news.
    - 'vision': Requests to generate images, create pictures, OR if the user attached an image ([Attached: ...jpg/png]).
    - 'pdf': Requests to generate a PDF document OR if the user attached a PDF document.
    - 'ppt': Requests to generate a PowerPoint presentation (PPT).
    - 'chat': General conversation, greetings, questions, or anything else that doesn't fit the above.

    RULES:
    - If the user attaches an image, route to 'vision'.
    - If the user attaches a document or pdf, route to 'pdf'.
    - If the user asks to "build", "code", or "create a website", route to 'coding'.
    - If the user asks for "latest news" or "search for", route to 'search'.
    - Respond ONLY with the exact intent string in lowercase (e.g., 'chat', 'coding', 'search', 'vision', 'pdf', 'ppt'). No other text.
  `);

  const response = await groqLLM.invoke([systemPrompt, new HumanMessage(lastMessage.content)]);
  const intent = response.content.trim().toLowerCase();

  return { intent };
};
