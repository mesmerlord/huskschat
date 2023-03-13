import {
  ActionIcon,
  Alert,
  Group,
  Paper,
  ScrollArea,
  Stack,
} from "@mantine/core";
import { useScrollIntoView } from "@mantine/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import ChatBox from "./ChatBox";
import ChatMessage from "./ChatMessage";
import { ChatMessageType, useStore } from "@/store/store";

interface ChatRoomProps {
  roomId: string;
}

const ChatRoom = ({ roomId }: ChatRoomProps) => {
  const dummy = useRef<HTMLDivElement>(null);
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });

  const [message, setMessage] = useState("");

  const messageRoomList = useStore((state) => state.messageRoomList);
  const addRoomMessage = useStore((state) => state.addRoomMessage);
  const addRoom = useStore((state) => state.addRoom);
  const setCurrentRoomId = useStore((state) => state.setCurrentRoomId);

  const room = useMemo(
    () => messageRoomList.find((storeRoom) => storeRoom.id === roomId),
    [messageRoomList, roomId]
  );

  const onMessageSubmit = () => {
    if (!room) {
      const newRoomId = crypto.randomUUID();
      const newRoom = {
        id: newRoomId,
        messages: [
          {
            id: crypto.randomUUID(),
            role: "system",
            content:
              "You are an AI model trained by OpenAI, be as concise as possible in your responses.",
          },
          {
            id: crypto.randomUUID(),
            role: "user",
            content: message,
          },
        ],
      };
      addRoom(newRoom);
      setCurrentRoomId(newRoomId);
    } else {
      addRoomMessage(roomId, {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
      });
    }

    setMessage("");
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

            {!room && (
              <ChatMessage
                content="Welcome to the chat room"
                role="system"
                id="system-message"
              />
            )}
            {messageRoomList
              .find((storeRoom) => storeRoom.id === roomId)
              ?.messages.map((msg, id) => {
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
