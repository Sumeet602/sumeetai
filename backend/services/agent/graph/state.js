import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
  messages: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  intent: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "chat",
  }),
  searchQuery: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  artifacts: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  // For file inputs (images/PDFs)
  files: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
});
