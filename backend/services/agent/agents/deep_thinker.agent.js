import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro",
    maxOutputTokens: 8192,
    temperature: 0.7 
});

export const deepThinkerAgentNode = async (state) => {
    try {
        const lastMessage = state.messages[state.messages.length - 1];
        
        const systemPrompt = `You are a Deep Thinker AI. You take complex problems and break them down into highly detailed, step-by-step logical deductions. 
Before providing the final answer, write out a <think> block where you explore the problem, analyze edge cases, and debate solutions. 
Then provide your final output.`;

        const response = await llm.invoke([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: lastMessage.content }
        ]);

        return {
            messages: [{ role: 'assistant', content: response.content }]
        };
    } catch (error) {
        console.error("Deep Thinker Error:", error);
        return {
            messages: [{ role: 'assistant', content: 'Error analyzing the problem.' }]
        };
    }
};
