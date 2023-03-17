import { NextApiRequest, NextApiResponse } from "next";
import { OpenAIEmbeddings } from "langchain/embeddings";

import { OpenAI } from "langchain";
import { HNSWLib } from "langchain/vectorstores";
import { ChatVectorDBQAChain } from "langchain/chains";

export default async function openaiHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const messages = req.body.messages;
    const apiKey = process.env.OPENAI_API_KEY;
    const documentId = req.body.documentId;
    try {
      const loadedVectorStore = await HNSWLib.load(
        `./src/embeddings/${documentId}/`,
        new OpenAIEmbeddings()
      );
      const chatModel = new OpenAI({
        temperature: 0,
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-3.5-turbo-0301",
      });
      const chain = ChatVectorDBQAChain.fromLLM(chatModel, loadedVectorStore);

      const newRes = await chain.call({
        question: messages[messages.length - 1]?.content,
        chat_history: messages?.map((message) => message.content),
      });
      res.status(200).json({ success: true, newRes });
    } catch (err) {
      console.error("Error with OpenAI request:", err);
      res.status(500).json({ success: false, err });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
