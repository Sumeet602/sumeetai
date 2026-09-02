import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash"
});

export const searchAgentNode = async (state) => {
    try {
        const lastMessage = state.messages[state.messages.length - 1];
        
        // In a full implementation, you would use TavilySearchResults tool here.
        // For now, we simulate a search augmented response.
        const systemPrompt = `You are a web search assistant. 
Since you don't have live internet access in this sandbox, explicitly state that you are simulating a search based on your training data up to your knowledge cutoff.
Provide the most accurate and up-to-date information possible.`;

        const response = await llm.invoke([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: lastMessage.content }
        ]);

        return {
            messages: [{ role: 'assistant', content: response.content }]
        };
    } catch (error) {
        console.error("Search Agent Error:", error);
        return {
            messages: [{ role: 'assistant', content: 'Error performing web search.' }]
        };
    }
};
