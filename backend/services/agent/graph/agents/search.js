import axios from "axios";
import { groqLLM } from "../../config/llmModels.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export const searchNode = async (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  let searchResults = "No results found.";

  try {
    // Zero Blockers: Fallback to DuckDuckGo via a free public proxy API if Tavily is missing/fails
    if (process.env.TAVILY_API_KEY) {
      const res = await axios.post("https://api.tavily.com/search", {
        api_key: process.env.TAVILY_API_KEY,
        query: lastMessage.content,
      });
      searchResults = JSON.stringify(res.data.results);
    } else {
      // Free fallback using Wikipedia API
      const wikiRes = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(lastMessage.content)}&utf8=&format=json`);
      if (wikiRes.data && wikiRes.data.query && wikiRes.data.query.search) {
        searchResults = JSON.stringify(wikiRes.data.query.search.slice(0, 5).map(s => ({ title: s.title, snippet: s.snippet.replace(/<[^>]*>?/gm, '') })));
      } else {
        searchResults = "No internet results found for: " + lastMessage.content;
      }
    }
  } catch (e) {
    console.error("Search failed, using fallback", e);
  }

  const systemPrompt = new SystemMessage(`
    You are Sumeet AI's expert research assistant. Use the following real-time search results to answer the user's query comprehensively.
    Always format your answer nicely in Markdown. Synthesize the information clearly. If the results are insufficient, answer to the best of your knowledge but mention that the search results were limited.
    Search Results: ${searchResults}
  `);

  const response = await groqLLM.invoke([systemPrompt, new HumanMessage(lastMessage.content)]);

  return {
    messages: [response],
  };
};
