import { QdrantVectorStore } from "@langchain/qdrant";
import { ChatAnthropic } from "@langchain/anthropic";
import { createStuffDocumentsChain } from "@langchain/classic/chains/combine_documents";
import { createRetrievalChain } from "@langchain/classic/chains/retrieval";
import { PromptTemplate } from "@langchain/core/prompts";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from 'dotenv';
dotenv.config();

export const pdfRagAgentNode = async (state) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1].content;

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY,
            collectionName: "pdf_documents",
        }
    );

    const retriever = vectorStore.asRetriever();

    const llm = new ChatAnthropic({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        model: "claude-3-5-sonnet-20240620",
    });

    const prompt = PromptTemplate.fromTemplate(`
    Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    
    {context}
    
    Question: {input}
    Answer:
    `);

    const combineDocsChain = await createStuffDocumentsChain({
        llm,
        prompt,
    });

    const retrievalChain = await createRetrievalChain({
        retriever,
        combineDocsChain,
    });

    const response = await retrievalChain.invoke({
        input: lastMessage,
    });

    return {
        messages: [{ role: 'assistant', content: response.answer }],
        agentType: 'pdfRag'
    };
};
