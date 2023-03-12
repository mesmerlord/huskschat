import {
  ActionIcon,
  Alert,
  Group,
  Paper,
  ScrollArea,
  Stack,
} from "@mantine/core";
import { useScrollIntoView } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import ChatBox from "./ChatBox";
import { Configuration, OpenAIApi } from "openai";
import ChatMessage from "./ChatMessage";

export declare const ChatCompletionRequestMessageRoleEnum: {
  readonly System: "system";
  readonly User: "user";
  readonly Assistant: "assistant";
};

type ChatMessageType = {
  id: string;
  content: string;
  role: typeof ChatCompletionRequestMessageRoleEnum[keyof typeof ChatCompletionRequestMessageRoleEnum];
};

const ChatRoom = () => {
  const dummy = useRef<HTMLDivElement>(null);
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });

  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState<ChatMessageType[]>([
    {
      id: "1",
      role: "system",
      content:
        "You are a AI model from OpenAI, answer as concisely as possible to the user's questions.",
    },
  ]);

  const messageCompletion = async () => {
    const configuration = new Configuration({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const messages = messageList.map((msg) => {
      return {
        content: msg.content,
        role: msg.role,
      };
    });

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0301",
      messages: messages,
    });
    const message = completion?.data?.choices[0]?.message;
    if (message) {
      setMessageList((value) => [
        ...value,
        { id: completion?.data?.id, ...message },
      ]);
    }
    setMessage("");
  };

  useEffect(() => {
    if (
      messageList.length > 1 &&
      messageList[messageList.length - 1].role === "user"
    ) {
      messageCompletion();
    }
  }, [messageList]);

  const onMessageSubmit = () => {
    setMessageList((value) => [
      ...value,
      { id: "2", role: "user", content: message },
    ]);
  };

  return (
    <>
      <Stack sx={{ height: "84vh" }} p={0}>
        <ScrollArea p="xs" scrollbarSize={1} sx={{ height: "84vh" }}>
          <Stack>
            <Group position="center" pt="xs">
              <Paper
                shadow="md"
                radius="xl"
                withBorder
                p={5}
                sx={{ position: "absolute", top: "93%" }}
              >
                Type your message
              </Paper>
            </Group>

            {messageList.map((msg, id) => {
              return (
                <ChatMessage
                  id={msg.id}
                  content={msg.content}
                  role={msg.role}
                />
              );
            })}
          </Stack>
          <div ref={targetRef}></div>
          <div ref={dummy}></div>
        </ScrollArea>
        <ChatBox
          onMessageSubmit={onMessageSubmit}
          message={message}
          setMessage={setMessage}
        />
      </Stack>
    </>
  );
};

export default ChatRoom;
