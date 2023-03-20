import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { Configuration, OpenAIApi } from "openai";
import db from "@/components/core/db";
export default async function openaiHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const messages = req.body.messages;
    const apiKey = process.env.OPENAI_API_KEY;
    const roomId = req?.body?.roomId;

    const session = await getSession({ req });

    try {
      const configuration = new Configuration({
        apiKey: apiKey,
      });
      const openai = new OpenAIApi(configuration);
      const completion = await openai
        .createChatCompletion({
          model: "gpt-3.5-turbo-0301",
          messages: messages,
        })
        .then(async ({ data }) => {
          const newMessages = {
            createMany: {
              data: [
                { text: messages?.slice(-1)[0]?.content, role: "user" },
                {
                  text: data?.choices[0]?.message?.content,
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

            if (!room) {
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
                data: [
                  {
                    text: messages?.slice(-1)[0]?.content,
                    role: "user",
                    roomId: room?.id,
                  },
                  {
                    text: data?.choices[0]?.message?.content,
                    role: "assistant",
                    roomId: room?.id,
                  },
                ],
              });
            }
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
