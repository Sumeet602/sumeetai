import { groqLLM } from "../../config/llmModels.js";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

export const visionNode = async (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  
  // Check if it's an image analysis request (Attached image)
  if (lastMessage.content.includes("[Attached:")) {
    const finalResponse = new AIMessage("I see you attached an image! My vision analysis module is still being configured by Sumeet, but I'm ready to generate new images for you if you describe them!");
    return { messages: [finalResponse] };
  }

  // Extract a prompt for image generation
  const systemPrompt = new SystemMessage(`
    You are an AI image prompt generator for Sumeet AI. 
    Convert the user's request into a highly detailed, descriptive, and visually rich image generation prompt.
    Return ONLY the prompt string, with no introductory text.
  `);

  const response = await groqLLM.invoke([systemPrompt, new HumanMessage(lastMessage.content)]);
  const imagePrompt = encodeURIComponent(response.content.trim());
  
  // Zero Blockers: Free image generation via Pollinations AI
  const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1024&height=1024&nologo=true`;

  const finalResponse = new AIMessage(`Here is the image you requested:`);

  return {
    messages: [finalResponse],
    artifacts: [{
      id: "vision-" + Date.now(),
      type: "image",
      title: "Generated Image",
      files: [{ name: "image.jpg", content: imageUrl }]
    }]
  };
};
