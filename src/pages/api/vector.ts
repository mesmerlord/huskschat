import { promises as fs } from "fs";
import { parseForm } from "@/components/lib/parse-form";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PDFLoader } from "@/components/lib/parse-document";
import formidable from "formidable";
import mime from "mime";
import { TextLoader } from "langchain/document_loaders";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  const { fields, files } = await parseForm(req);
  const file = files.file as formidable.File;

  //   const fileBuffer = await fs.readFile(file.path);
  if (!file) {
    res.status(400);
    res.json({ success: false, error: "No file found" });
    return;
  }
  const docs = [];
  const mimeType = mime.getExtension(file.mimetype || "");
  switch (file.mimetype) {
    case "application/pdf": {
      const loader = new PDFLoader(file?.filepath);
      const pdfDocs = await loader.load();
      docs.push(...pdfDocs);
      break;
    }

    case "text/plain": {
      const loader = new TextLoader(file?.filepath);
      const textDocs = await loader.load();
      docs.push(...textDocs);
      break;
    }
    default:
      res.status(400);
      res.json({ success: false, error: "File type not supported" });
      return;
  }
  const fileName = file.newFilename.replace(`.${mimeType}`, "");
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
