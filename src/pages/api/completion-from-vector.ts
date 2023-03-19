import { NextApiRequest, NextApiResponse } from "next";
import { OpenAIEmbeddings } from "langchain/embeddings";

import { OpenAI } from "langchain";
import { HNSWLib } from "langchain/vectorstores";
import { ChatVectorDBQAChain } from "langchain/chains";
import * as crypto from "crypto";

export default async function openaiHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const messages = req.body.messages;
    const apiKey = process.env.OPENAI_API_KEY;
    const documentId = req.body.documentId;
    const modelName = "gpt-3.5-turbo-0301";
    try {
      const loadedVectorStore = await HNSWLib.load(
        `./src/embeddings/${documentId}/`,
        new OpenAIEmbeddings()
      );
      const chatModel = new OpenAI({
        temperature: 0,
        openAIApiKey: apiKey,
        modelName: modelName,
      });
      const chain = ChatVectorDBQAChain.fromLLM(chatModel, loadedVectorStore, {
        k: 2,
      });

      const newRes = await chain.call({
        question: messages[messages.length - 1]?.content,
        chat_history: messages?.splice(-1)?.map((message) => message.content),
      });
      const prompt_tokens = messages?.reduce((acc, message) => {
        return acc + message?.content?.split(" ").length;
      }, 0);
      const completion_token = newRes?.text?.split(" ")?.length || 0;

      const response_dict = {
        model: modelName,
        id: crypto.randomUUID(),
        usage: {
          completion_token: completion_token,
          prompt_tokens: prompt_tokens,
          total_tokens: completion_token + prompt_tokens,
        },

        choices: [
          {
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: newRes?.text,
            },
          },
        ],
      };
      res.status(200).json({ success: true, data: response_dict });
    } catch (err) {
      console.error("Error with OpenAI request:", err);
      res.status(500).json({ success: false, err });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
