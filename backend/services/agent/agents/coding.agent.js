import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro",
    maxOutputTokens: 8192,
    temperature: 0.1 // Lower temperature for more deterministic code
});

export const codingAgentNode = async (state) => {
    try {
        const lastMessage = state.messages[state.messages.length - 1];
        
        const systemPrompt = `You are an expert coding assistant. Write clean, efficient, and well-documented code. 
Only output the code, without any markdown formatting or conversational filler like "Here is the code". 
Do not use triple backticks if you are returning full files.`;

        const response = await llm.invoke([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: lastMessage.content }
        ]);

        return {
            messages: [{ role: 'assistant', content: response.content }]
        };
    } catch (error) {
        console.error("Coding Agent Error:", error);
        return {
            messages: [{ role: 'assistant', content: 'Error generating code.' }]
        };
    }
};
