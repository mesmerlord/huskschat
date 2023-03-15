import {
  ActionIcon,
  Box,
  Container,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useScrollIntoView } from "@mantine/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import ChatBox from "./ChatBox";
import ChatMessage from "./ChatMessage";
import {
  ChatCompletionRequestMessageRoleEnum,
  ChatMessageType,
  ChatRoomType,
  getOpenAiCompletion,
  useStore,
  getServerCompletion,
} from "@/store/store";
import ChangeApiModal from "../common/ChangeApiModal";
import { showNotification } from "@mantine/notifications";
import { FeaturesTitle } from "../common/Features";

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
  const userPlan = useStore((state) => state.userPlan);

  const [room, setRoom] = useState<ChatRoomType>(
    messageRoomList?.find((storeRoom) => storeRoom.id === roomId) || {
      messages: [],
    }
  );

  useEffect(() => {
    setRoom(
      messageRoomList?.find((storeRoom) => storeRoom.id === roomId) || {
        messages: [],
      }
    );
    console.log(room, "room");
    dummy.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomId, messageRoomList]);

  useEffect(() => {
    setMessage("");
  }, [roomId, messageRoomList]);

  const switchResponseForPlan = async (
    plan: string,
    messages: ChatMessageType[]
  ) => {
    switch (plan) {
      case "free":
        const freeCompletion = await getServerCompletion(messages)
          .then((res) => {
            if (res?.status === 200) {
              setOpenAiLoading(false);
              const resJson = res.json().then((data) => {
                return data;
              });
              return resJson;
            } else {
              console.log(res);
              const resJson = res.json().then((data) => {
                showNotification({
                  title: "Error",
                  message:
                    data?.error?.message ||
                    "Error communicating with OpenAI, please try again later",
                  color: "red",
                  icon: <ActionIcon color="red" />,
                });
                return null;
              });
            }
          })
          .catch((err) => {
            setOpenAiLoading(false);
            return err;
          });
        return freeCompletion;
      case "hosted":
        const openAiCompletion = getOpenAiCompletion(messages, apiKey)
          .then((res) => {
            setOpenAiLoading(false);
            return res;
          })
          .catch((err) => {
            setOpenAiLoading(false);
            showNotification({
              title: "Error",
              message:
                err?.error?.message ||
                "Error communicating with OpenAI, please try again later",
              color: "red",
              icon: <ActionIcon color="red" />,
            });
            return null;
          });
        return openAiCompletion;

      default:
        return null as never;
    }
  };

  const onMessageSubmit = async () => {
    if (!apiKey && userPlan !== "free") {
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

      addRoomMessage(newRoomId, userPrompt, 0, systemPrompt);
      setMessage("");
      setOpenAiLoading(true);
      const completion = await switchResponseForPlan(userPlan, [
        systemPrompt,
        userPrompt,
      ]);

      const newMessage = completion?.data?.choices[0]?.message;
      if (completion && completion?.data?.choices?.length > 0 && newMessage) {
        const assistantPrompt = {
          id: completion?.data?.id,
          role: ChatCompletionRequestMessageRoleEnum.ASSISTANT,
          content: newMessage.content,
        };
        setRoom({
          id: newRoomId,
          messages: [systemPrompt, userPrompt, assistantPrompt],
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
        const titleCompletion = await switchResponseForPlan(userPlan, [
          systemPrompt,
          userPrompt,
        ]);
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
      const completion = await switchResponseForPlan(userPlan, [
        ...room.messages,
        userPrompt,
      ]);

      setOpenAiLoading(false);
      if (completion && completion?.data?.choices?.length > 0) {
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
        {!roomId && (
          <Container>
            <Group position="center" spacing={2}>
              <Title
                order={1}
                sx={(theme) => ({
                  [theme.fn.smallerThan("md")]: { fontSize: "30px" },
                  fontSize: "45px",
                })}
              >
                🌽Husks
              </Title>
              <Title
                order={1}
                sx={(theme) => ({
                  color: theme.colors.yellow[8],
                  [theme.fn.smallerThan("md")]: { fontSize: "30px" },
                  fontSize: "45px",
                })}
              >
                Chat
              </Title>
            </Group>
            <FeaturesTitle />
          </Container>
        )}
        <ScrollArea
          p={0}
          scrollbarSize={1}
          sx={{ height: "84vh", paddingBottom: "1rem" }}
        >
          <Container
            sx={(theme) => ({
              [theme.fn.smallerThan("sm")]: {
                padding: "0.2rem",
              },
            })}
          >
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
