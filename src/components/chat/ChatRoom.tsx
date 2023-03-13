import {
  ActionIcon,
  Alert,
  Box,
  Container,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useScrollIntoView } from "@mantine/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import ChatBox from "./ChatBox";
import ChatMessage from "./ChatMessage";
import {
  ChatCompletionRequestMessageRoleEnum,
  ChatRoomType,
  getOpenAiCompletion,
  useStore,
} from "@/store/store";
import ChangeApiModal from "../common/ChangeApiModal";

interface ChatRoomProps {
  roomId: string;
}

const ChatRoom = ({ roomId }: ChatRoomProps) => {
  const dummy = useRef<HTMLDivElement>(null);
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });

  const [message, setMessage] = useState("");

  const [openAiLoading, setOpenAiLoading] = useState(false);
  const [apiKeyModal, setApiKeyModal] = useState(false);

  const messageRoomList = useStore((state) => state.messageRoomList);
  const addRoomMessage = useStore((state) => state.addRoomMessage);
  const setRoomName = useStore((state) => state.setRoomName);
  const apiKey = useStore((state) => state.apiKey);

  const [room, setRoom] = useState<ChatRoomType>(
    messageRoomList?.find((storeRoom) => storeRoom.id === roomId) || []
  );

  useEffect(() => {
    setRoom(
      messageRoomList?.find((storeRoom) => storeRoom.id === roomId) || []
    );
    dummy.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomId, messageRoomList]);

  useEffect(() => {
    setMessage("");
  }, [roomId, messageRoomList]);

  const onMessageSubmit = async () => {
    if (!apiKey) {
      setApiKeyModal(true);
      return;
    }
    const userPrompt = {
      id: crypto.randomUUID(),
      role: ChatCompletionRequestMessageRoleEnum.USER,
      content: message,
    };
    if (!roomId || !room?.messages) {
      const newRoomId = crypto.randomUUID();
      const systemPrompt = {
        id: crypto.randomUUID(),
        role: ChatCompletionRequestMessageRoleEnum.SYSTEM,
        content:
          "You are an AI model trained by OpenAI, be as concise as possible in your responses.",
      };

      addRoomMessage(newRoomId, userPrompt, systemPrompt);
      setMessage("");

      const completion = await getOpenAiCompletion(
        [systemPrompt, userPrompt],
        apiKey
      );
      const newMessage = completion?.data?.choices[0]?.message;
      if (completion && completion.data.choices.length > 0 && newMessage) {
        const assistantPrompt = {
          id: completion?.data?.id,
          role: ChatCompletionRequestMessageRoleEnum.ASSISTANT,
          content: newMessage.content,
        };
        setRoom({
          id: newRoomId,
          messages: [userPrompt, systemPrompt, assistantPrompt],
          name: userPrompt.content,
          createdAt: new Date(),
          tokensUsed: completion?.data?.usage?.total_tokens ?? 0,
        });
        addRoomMessage(
          newRoomId,
          assistantPrompt,
          completion?.data?.usage?.total_tokens ?? 0
        );
        const newTitlePrompt = {
          id: crypto.randomUUID(),
          role: ChatCompletionRequestMessageRoleEnum.USER,
          content:
            "Answer with a upto 3 word title for this chat, only the title.",
        };
        setOpenAiLoading(true);
        const titleCompletion = await getOpenAiCompletion(
          [systemPrompt, userPrompt, newTitlePrompt],
          apiKey
        );
        setOpenAiLoading(false);
        const newTitleMessage = titleCompletion?.data?.choices[0]?.message;
        if (
          titleCompletion &&
          titleCompletion.data.choices.length > 0 &&
          newTitleMessage
        ) {
          setRoomName(newRoomId, newTitleMessage.content);
        }
      }
    } else {
      setMessage("");
      addRoomMessage(roomId, userPrompt);

      setOpenAiLoading(true);

      const completion = await getOpenAiCompletion(
        [...room.messages, userPrompt],
        apiKey
      );
      setOpenAiLoading(false);
      if (completion && completion.data.choices.length > 0) {
        const newMessage = completion?.data?.choices[0]?.message;

        const assistantPrompt = {
          id: completion?.data?.id,
          ...newMessage,
        };

        addRoomMessage(
          roomId,
          assistantPrompt,
          completion?.data?.usage?.total_tokens ?? 0
        );
      }
    }
  };

  return (
    <>
      <Stack sx={{ height: "84vh" }} p={0}>
        <ScrollArea p="xs" scrollbarSize={1} sx={{ height: "84vh" }}>
          <Container>
            <Stack>
              {openAiLoading && (
                <Group position="center" pt="xs">
                  <Paper
                    shadow="md"
                    radius="xl"
                    withBorder
                    p={8}
                    sx={{ position: "absolute", top: "93%" }}
                  >
                    <Group noWrap>
                      {" "}
                      <Loader size="sm" variant="dots" />{" "}
                      <Text> Communicating with OpenAI</Text>
                    </Group>
                  </Paper>
                </Group>
              )}
              <Box sx={{ marginBottom: "2rem" }}>
                {!room && (
                  <ChatMessage
                    content="Welcome to the chat room"
                    role="system"
                    id="system-message"
                  />
                )}
                {messageRoomList
                  .find((storeRoom) => storeRoom.id === roomId)
                  ?.messages?.slice(1)
                  .map((msg, id) => {
                    return (
                      <ChatMessage
                        id={msg?.id || "test"}
                        content={msg.content}
                        role={msg.role}
                      />
                    );
                  })}
              </Box>
            </Stack>

            <div ref={targetRef}></div>
            <div ref={dummy}></div>
          </Container>
        </ScrollArea>
        <ChangeApiModal opened={apiKeyModal} setOpened={setApiKeyModal} />
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