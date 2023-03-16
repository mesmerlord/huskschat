import { promises as fs } from "fs";
import formidable from "formidable";
const { ChromaClient } = require("chromadb");
import { PDFLoader } from "langchain/document_loaders";
import { parseForm } from "@/components/lib/parse-form";
import { Chroma } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { OpenAI } from "langchain";
import { ChatVectorDBQAChain } from "langchain/chains";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  const { fields, files } = await parseForm(req);
  const file = files.file;

  //   const fileBuffer = await fs.readFile(file.path);
  const loader = new PDFLoader(file.filepath);
  const fileName = file.name;
  const docs = await loader.load();
  const vectorStore = await Chroma.fromDocuments(
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-ada-002",
    }),
    {
      collectionName: "test1",
      url: "http://localhost:8000",
    }
  );

  const chatModel = new OpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo-0301",
  });
  const chain = ChatVectorDBQAChain.fromLLM(chatModel, vectorStore);
  const question = "what does Mesmer do?";
  const newRes = await chain.call({ question: question, chat_history: [] });
  console.log(newRes);

  res.status(200);
  res.json({ success: true });
};
