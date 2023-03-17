import { promises as fs } from "fs";
import { parseForm } from "@/components/lib/parse-form";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PDFLoader } from "@/components/lib/parse-document";

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
  const fileName = file.newFilename.replace(".pdf", "");
  const docs = await loader.load();

  const vectorStore = await HNSWLib.fromDocuments(
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-ada-002",
    })
  );

  try {
    fs.mkdir(`./src/embeddings/${fileName}/`);
  } catch (err) {
    console.log(err);
  }
  vectorStore.save(`./src/embeddings/${fileName}/`);

  //   const chatModel = new OpenAI({
  //     temperature: 0,
  //     openAIApiKey: process.env.OPENAI_API_KEY,
  //     modelName: "gpt-3.5-turbo-0301",
  //   });
  //   const chain = ChatVectorDBQAChain.fromLLM(chatModel, vectorStore);
  //   const question = "what does Mesmer do?";
  //   const newRes = await chain.call({ question: question, chat_history: [] });

  res.status(200);
  res.json({ success: true, id: fileName });
};
