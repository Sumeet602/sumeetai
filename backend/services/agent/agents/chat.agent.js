import { groqLLM } from "../config/llmModels.js";
const llm = groqLLM;

export const chatAgentNode = async (state) => {
    try {
        const lastMessage = state.messages[state.messages.length - 1];
        
        // This is a basic pass-through for the chat agent.
        // You can add system prompts and history context here.
        const response = await llm.invoke(lastMessage.content);

        return {
            messages: [{ role: 'assistant', content: response.content }]
        };
    } catch (error) {
        console.error("Chat Agent Error:", error);
        return {
            messages: [{ role: 'assistant', content: 'I encountered an error while processing your request.' }]
        };
    }
};
