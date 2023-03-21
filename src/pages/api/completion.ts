import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import db from "@/components/core/db";
import { getSession } from "next-auth/react";

export default async function openaiHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const messages = req.body.messages;
    const apiKey = process.env.OPENAI_API_KEY;
    const roomId = req?.body?.roomId;
    const modelName = req?.body?.modelName;

    const session = await getSession({ req });
    let basePath = "https://api.openai.com/v1";

    if (modelName === "chatglm") {
      basePath = process.env.CHATGLM_URL;
      console.log("ChatGLM", basePath);
    }

    try {
      const configuration = new Configuration({
        apiKey: apiKey,
        basePath,
      });
      const openai = new OpenAIApi(configuration);
      let completion;
      if (modelName === "chatglm") {
        completion = openai.createCompletion({
          model: "gpt-3.5-turbo-0301",
          prompt: messages?.map((message) => message.content).join(""),
          max_tokens: 3000,
        });
      } else {
        completion = openai.createChatCompletion({
          model: "gpt-3.5-turbo-0301",
          messages: messages,
        });
      }
      completion
        .then(async ({ data }) => {
          const newMessages = {
            createMany: {
              data: [
                { text: messages?.slice(-1)[0]?.content, role: "user" },
                {
                  text:
                    data?.choices[0]?.message?.content ||
                    data?.choices[0]?.text,
                  role: "assistant",
                },
              ],
            },
          };

          if (roomId) {
            const room = await db.room.findFirst({
              where: {
                externalId: roomId,
              },
            });

            if (!room && session?.user?.email) {
              const newRoom = await db.room.create({
                data: {
                  externalId: roomId,
                  name: roomId,
                  messages: newMessages,
                  userId: session?.user?.email
                    ? await db.user
                        .findUnique({
                          where: {
                            email: session?.user?.email,
                          },
                        })
                        .then((user) => user?.id)
                    : null,
                },
              });
            }
            if (room) {
              await db.message.createMany({
                data: newMessages?.createMany?.data?.map((message) => ({
                  ...message,
                  roomId: room?.id,
                })),
              });
            }
          }
          const chatGlmData = {
            ...data,
            choices: [
              {
                finish_reason: "stop",
                index: 0,
                message: {
                  role: "assistant",
                  content: data?.choices[0]?.text,
                },
              },
            ],
          };
          if (modelName === "chatglm") {
            res.status(200).json({ data: chatGlmData });
            return res;
          }

          res.status(200).json({ data });
        })
        .catch((err) => {
          console.error(
            "Error with OpenAI request:",
            err?.response?.data?.error
          );
          res
            .status(404)
            .json({ success: false, error: err?.response?.data?.error });
        });
    } catch (err) {
      console.error("Error with OpenAI request:", err);
      res.status(500).json({ success: false, err });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
