import {
  ActionIcon,
  Container,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
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
  getServerDocumentCompletion,
} from "@/store/store";
import ChangeApiModal from "../common/ChangeApiModal";
import { showNotification } from "@mantine/notifications";
import { FeaturesTitle } from "../common/Features";
import Dropfile from "../common/DropFile";
import { getPrompt } from "../lib/open-ai-prompts";
import DocumentChatMessage from "./DocumentChatMessage";

interface ChatRoomProps {
  roomId: string;
}

const ChatRoom = ({ roomId }: ChatRoomProps) => {
  const dummy = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");

  const [openAiLoading, setOpenAiLoading] = useState(false);
  const [openAiReloading, setOpenAiReloading] = useState(false);
  const [apiKeyModal, setApiKeyModal] = useState(false);
  const [showDropBox, setShowDropBox] = useState(false);
  const [showUploadButton, setShowUploadButton] = useState(true);

  const messageRoomList = useStore((state) => state.messageRoomList);
  const addRoomMessage = useStore((state) => state.addRoomMessage);
  const addRoom = useStore((state) => state.addRoom);
  const replaceRoomMessage = useStore((state) => state.replaceRoomMessage);
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
    dummy.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomId, messageRoomList]);

  useEffect(() => {
    setMessage("");
  }, [roomId]);

  const switchResponseForPlan = async (
    plan: string,
    messages: ChatMessageType[],
    type: "completion" | "documentCompletion" = "completion"
  ) => {
    switch (plan) {
      case "free":
        if (room?.documentId && type === "documentCompletion") {
          const completion = await getServerDocumentCompletion(
            messages,
            room?.documentId
          ).then((res) => {
            if (res?.status === 200) {
              setOpenAiLoading(false);
              setOpenAiReloading(false);
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
          });
          return completion;
        }
        const freeCompletion = await getServerCompletion(messages)
          .then((res) => {
            if (res?.status === 200) {
              setOpenAiLoading(false);
              setOpenAiReloading(false);
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
            setOpenAiReloading(false);
            return err;
          });
        return freeCompletion;
      case "hosted":
        if (room?.documentId !== "") {
          showNotification({
            title: "Error",
            message: "This feature is only available on the hosted plan",
            color: "red",
            icon: <ActionIcon color="red" />,
          });
          return null;
        }
        const openAiCompletion = getOpenAiCompletion(messages, apiKey)
          .then((res) => {
            setOpenAiLoading(false);
            setOpenAiReloading(false);
            return res;
          })
          .catch((err) => {
            setOpenAiLoading(false);
            setOpenAiReloading(false);
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
    const userPrompt = getPrompt({ type: "user", message });
    if (!roomId || !room?.messages) {
      const newRoomId = crypto.randomUUID();
      const systemPrompt = getPrompt({ type: "system", message: "" });
      addRoomMessage(newRoomId, userPrompt, 0, systemPrompt);
      setMessage("");
      setOpenAiLoading(true);
      const completion = await switchResponseForPlan(
        userPlan,
        [systemPrompt, userPrompt],
        "documentCompletion"
      );

      const newMessage = completion?.data?.choices[0]?.message;
      if (completion && completion?.data?.choices?.length > 0 && newMessage) {
        const assistantPrompt = {
          id: completion?.data?.id,
          role: ChatCompletionRequestMessageRoleEnum.ASSISTANT,
          content: newMessage.content,
          cumalativeTokensUsed:
            (room?.tokensUsed || 0) +
            (completion?.data?.usage?.total_tokens || 0),
        };
        setRoom({
          id: newRoomId,
          messages: [systemPrompt, userPrompt, assistantPrompt],
          name: userPrompt.content,
          createdAt: new Date(),
          tokensUsed: completion?.data?.usage?.total_tokens ?? 0,
          documentId: "",
        });
        addRoomMessage(
          newRoomId,
          assistantPrompt,
          completion?.data?.usage?.total_tokens ?? 0
        );
        const newTitlePrompt = getPrompt({
          type: "title",
          message: "",
        });

        const titleCompletion = await switchResponseForPlan(
          userPlan,
          [systemPrompt, userPrompt, newTitlePrompt],
          "completion"
        );
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

      let newRoomMessages = room?.messages;

      if (room?.tokensUsed && room?.tokensUsed > 3000) {
        const reversedMessages = room?.messages?.slice()?.reverse();
        const lastSummaryIndex = reversedMessages?.findIndex(
          (msg) => msg.isSummary
        );
        if (lastSummaryIndex && lastSummaryIndex > 0) {
          const newMessages = reversedMessages?.slice(0, lastSummaryIndex + 1);
          newRoomMessages = newMessages?.slice()?.reverse();
          console.log(newMessages, newRoomMessages);

          const lastRooomMessage = newRoomMessages?.slice(-1)[0];
          if (
            lastRooomMessage &&
            (lastRooomMessage?.cumalativeTokensUsed || 0) > 3000
          ) {
            const summaryPrompt = getPrompt({ type: "summary", message: "" });
            const summaryCompletion = await switchResponseForPlan(
              userPlan,
              [...newRoomMessages, summaryPrompt],
              "documentCompletion"
            );
            if (
              summaryCompletion &&
              summaryCompletion?.data?.choices?.length > 0
            ) {
              const newMessage = summaryCompletion?.data?.choices[0]?.message;

              const assistantPrompt = {
                id: summaryCompletion?.data?.id,
                cumalativeTokensUsed:
                  0 + (summaryCompletion?.data?.usage?.completion_tokens || 0),
                isSummary: true,
                ...newMessage,
              };

              addRoomMessage(
                roomId,
                assistantPrompt,
                summaryCompletion?.data?.usage?.total_tokens ?? 0
              );
              newRoomMessages = [...newRoomMessages, assistantPrompt];
            }
          }
        } else {
          const summaryPrompt = getPrompt({ type: "summary", message: "" });
          const summaryCompletion = await switchResponseForPlan(
            userPlan,
            [...newRoomMessages, summaryPrompt],
            "documentCompletion"
          );
          if (
            summaryCompletion &&
            summaryCompletion?.data?.choices?.length > 0
          ) {
            const newMessage = summaryCompletion?.data?.choices[0]?.message;

            const assistantPrompt = {
              id: summaryCompletion?.data?.id,
              cumalativeTokensUsed:
                0 + (summaryCompletion?.data?.usage?.total_tokens || 0),
              isSummary: true,

              ...newMessage,
            };

            addRoomMessage(
              roomId,
              assistantPrompt,
              summaryCompletion?.data?.usage?.completion_tokens ?? 0
            );
            const systemPrompt = getPrompt({ type: "system", message: "" });
            newRoomMessages = [systemPrompt, assistantPrompt];
          }
        }
      }
      const completion = await switchResponseForPlan(
        userPlan,
        [...newRoomMessages, userPrompt],
        "documentCompletion"
      );

      setOpenAiLoading(false);
      if (completion && completion?.data?.choices?.length > 0) {
        const newMessage = completion?.data?.choices[0]?.message;
        const lastRooomMessage = newRoomMessages?.slice(-1)[0];
        const assistantPrompt = {
          id: completion?.data?.id,
          cumalativeTokensUsed:
            (lastRooomMessage?.cumalativeTokensUsed || 0) +
            (completion?.data?.usage?.completion_tokens || 0),
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

  const onFileUpload = async (res) => {
    const systemPrompt = getPrompt({ type: "system", message: "" });
    addRoom((roomId = crypto.randomUUID()), {
      documentId: res?.data?.id,
      messages: [systemPrompt],
    });
  };

  const regenerateMessage = async (messageId: string) => {
    setOpenAiReloading(true);

    const previousMessages = room.messages.filter(
      (msg) => msg.id !== messageId
    );
    const completion = await switchResponseForPlan(
      userPlan,
      [...previousMessages],
      "documentCompletion"
    );
    setOpenAiReloading(false);

    if (completion && completion?.data?.choices?.length > 0) {
      const newMessage = completion?.data?.choices[0]?.message;
      if (!newMessage) {
        return;
      }

      const assistantPrompt = {
        id: completion?.data?.id,
        ...newMessage,
      };
      replaceRoomMessage(
        roomId,
        messageId,
        assistantPrompt,
        completion?.data?.usage?.total_tokens ?? 0
      );
    }
  };

  const newMessages = useMemo(() => {
    const messages = messageRoomList
      .find((storeRoom) => storeRoom.id === roomId)
      ?.messages?.slice(1);
    return messages?.map((msg, id) => {
      return (
        <ChatMessage
          key={msg?.id || "test"}
          id={msg?.id || "test"}
          content={msg?.content}
          role={msg?.role}
          lastMessage={id === messages.length - 1 && !openAiReloading}
          regenerateMessage={regenerateMessage}
          isSummary={msg?.isSummary}
        />
      );
    });
  }, [roomId, messageRoomList, openAiReloading]);

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
          sx={{ height: "80vh", paddingBottom: "1rem" }}
        >
          <Container
            sx={(theme) => ({
              [theme.fn.smallerThan("sm")]: {
                padding: "0.2rem",
              },
            })}
          >
            <Stack spacing={2}>
              {room?.documentId && (
                <DocumentChatMessage message="You have a document attached to this chat." />
              )}
              {newMessages}
            </Stack>

            <div ref={dummy}></div>
          </Container>
        </ScrollArea>
        <ChangeApiModal opened={apiKeyModal} setOpened={setApiKeyModal} />
        {(openAiLoading || openAiReloading) && (
          <Group position="center" pt="xs">
            <Paper shadow="md" radius="xl" p={8}>
              <Group noWrap>
                <Loader size="sm" variant="dots" />{" "}
                <Text>
                  {openAiLoading && "Communicating with OpenAI"}{" "}
                  {openAiReloading && "Regenerating message"}{" "}
                </Text>
              </Group>
            </Paper>
          </Group>
        )}
        {showDropBox && <Dropfile onFileUpload={onFileUpload} />}
        <ChatBox
          onMessageSubmit={onMessageSubmit}
          message={message}
          setMessage={setMessage}
          setShowDropBox={setShowDropBox}
          showUploadButton={showUploadButton}
        />
      </Stack>
    </>
  );
};

export default ChatRoom;
