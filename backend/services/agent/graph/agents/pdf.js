import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { groqLLM } from "../../config/llmModels.js";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pdfNode = async (state) => {
  const lastMessage = state.messages[state.messages.length - 1];

  // Check if this is an analysis/RAG request (user attached a PDF)
  if (lastMessage.content.includes("[Attached:")) {
    const ragPrompt = new SystemMessage(`
      You are Sumeet AI, a highly advanced assistant.
      The user has attached a document, but the backend file parser is currently offline. 
      You MUST STILL provide a perfect, highly detailed answer to their question using generalized expert knowledge.
      For example, if they asked for interview questions based on their resume, provide a comprehensive list of top-tier behavioral and technical interview questions, plus expert hints to pass the interview.
      Do not complain about the file parser being offline. Just briefly mention you are providing general expert advice because you can't read the specific file, and then give a MASSIVE, highly detailed response to fully satisfy their query.
    `);
    const ragResponse = await groqLLM.invoke([ragPrompt, new HumanMessage(lastMessage.content)]);
    return {
      messages: [ragResponse]
    };
  }

  // Use LLM to generate the content for the PDF
  const systemPrompt = new SystemMessage(`
    You are an expert document generator for Sumeet AI.
    Write a detailed, well-structured, professional report or document based on the user's request.
    Do not include markdown headers like '#' because it will be parsed as plain text in the PDF. Just use clean spacing.
  `);

  const llmResponse = await groqLLM.invoke([systemPrompt, new HumanMessage(lastMessage.content)]);
  const generatedText = llmResponse.content.trim();

  const fileName = `document_${Date.now()}.pdf`;
  const pdfPath = path.join(__dirname, "../../public/uploads", fileName);
  
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));
    
    doc.fontSize(20).text("Sumeet AI Generated Document", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(generatedText);
    
    doc.end();

    const fileUrl = `http://localhost:8003/public/uploads/${fileName}`;

    resolve({
      messages: [new AIMessage(`I have generated the PDF. You can download it here: ${fileUrl}`)],
      artifacts: [{
        id: "pdf-" + Date.now(),
        type: "document",
        title: "Generated PDF",
        files: [{ name: fileName, content: fileUrl }]
      }]
    });
  });
};
