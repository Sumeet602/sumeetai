import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import { getMemory } from "../config/memory.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const chatAgent = async (state) => {

   

    try {

        await checkAgentLimit(state.userId,"chat")

         const llm = await getModel("chat")

    const history = await getMemory(state.conversationId)

   const searchContext=state.searchResults?`
   Web Search Results:

${JSON.stringify(state.searchResults)}

Answer the user using only the above search results.
`:""


    const systemPrompt = `
    You are SumeetAI, an intelligent AI assistant.


    ${searchContext}

    If searchContext exists:

- Use search results to answer.
- Do not mention internal tools.


    Rules:

- You have the full conversation history above. Always use it: resolve
  references like "this", "that", "it", "the same", short follow-ups
  ("2 4", "in python", "shorter") against what was said earlier, and stay
  consistent with earlier answers.
- Users often make typos or write loosely. Infer the intended meaning
  from context and answer that; only ask for clarification if the intent
  is genuinely ambiguous.
- For simple questions, greetings, and short queries, respond naturally in plain text.
- For technical, educational, coding, or detailed topics, use clean Markdown.


 Formatting:

- Use # for titles and ## for sections.
- Leave a blank line after headings.
- Use bullet points for lists.
- Use numbered lists for steps.
- Use fenced code blocks with language tags for code.
- Keep paragraphs short and readable.
- Never write headings and content on the same line.
- Never generate large walls of text.
`
    const messages = [
        new SystemMessage(systemPrompt)
    ]

    const safeHistory = Array.isArray(history) ? history : []

    safeHistory.forEach(msg => {
        if (!msg?.content) return
        if (msg.role == "user") {
            messages.push(new HumanMessage(msg.content))
        }
        if (msg.role == "assistant") {
            messages.push(new AIMessage(msg.content))
        }
    });

    // The controller persists the user prompt before the graph runs, so a
    // history rebuilt from the DB can already end with it - don't send it twice.
    const lastUser = [...safeHistory].reverse().find(m => m?.role === "user")
    if (!lastUser || lastUser.content !== state.prompt) {
        messages.push(new HumanMessage(state.prompt))
    }





    const response = await llm.invoke(messages)
      await deductCredits(state.userId,"chat")
   
    return {
        ...state,
        aiResponse: response.content,
        
    }
    } catch (error) {
        console.log(error)
         return {
            ...state,
            aiResponse:error?.data?.message || "failed to generate chat"
        }
        
    
    }
   
}
