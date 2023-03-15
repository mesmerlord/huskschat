import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

export default async function openaiHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const messages = req.body.messages;
    const apiKey = process.env.OPENAI_API_KEY;

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
        .then(({ data }) => {
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
