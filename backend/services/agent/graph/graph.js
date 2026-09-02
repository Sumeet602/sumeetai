import { StateGraph, START, END } from "@langchain/langgraph";
import { chatAgentNode } from "../agents/chat.agent.js";
import { codingAgentNode } from "../agents/coding.agent.js";
import { visionAgentNode } from "../agents/vision.agent.js";
import { searchAgentNode } from "../agents/search.agent.js";
import { deepThinkerAgentNode } from "../agents/deep_thinker.agent.js";
import { pdfRagAgentNode } from "../agents/pdfRag.agent.js";
import { routeAgent } from "./router.js";

// Extremely basic LangGraph state machine setup
const agentState = {
  messages: {
    value: (x, y) => x.concat(y),
    default: () => [],
  },
  agentType: {
    value: (x, y) => y ?? x,
    default: () => "chat",
  },
};

const builder = new StateGraph({ channels: agentState });

// Register nodes
builder.addNode("chatAgent", chatAgentNode);
builder.addNode("codingAgent", codingAgentNode);
builder.addNode("visionAgent", visionAgentNode);
builder.addNode("searchAgent", searchAgentNode);
builder.addNode("deepThinkerAgent", deepThinkerAgentNode);
builder.addNode("pdfRagAgent", pdfRagAgentNode);

// Define edges
builder.addConditionalEdges(START, routeAgent);

builder.addEdge("chatAgent", END);
builder.addEdge("codingAgent", END);
builder.addEdge("visionAgent", END);
builder.addEdge("searchAgent", END);
builder.addEdge("deepThinkerAgent", END);
builder.addEdge("pdfRagAgent", END);

const graph = builder.compile();

export const runAgentGraph = async (prompt, agentType) => {
    const initialState = {
        messages: [{ role: 'user', content: prompt }],
        agentType
    };
    
    const finalState = await graph.invoke(initialState);
    return finalState.messages[finalState.messages.length - 1].content;
};
