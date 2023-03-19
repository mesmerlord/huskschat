import { useStore } from "@/store/store";
import { Box, ScrollArea } from "@mantine/core";
import { useMemo } from "react";
import ChatHistoryItem from "./ChatHistoryItem";

const PreviousChats = ({ search }) => {
  const messageRoomList = useStore((state) => state.messageRoomList);
  const filteredMessageRoomList = useMemo(() => {
    if (search) {
      return messageRoomList.filter((room) => {
        if (
          room?.name &&
          room?.name.toLowerCase().includes(search.toLowerCase())
        ) {
          return true;
        }
        return room?.messages?.some((message) =>
          message.content.toLowerCase().includes(search.toLowerCase())
        );
      });
    }
    return messageRoomList;
  }, [messageRoomList, search]);

  return (
    <ScrollArea h={500} type="always">
      {filteredMessageRoomList
        .slice()
        .reverse()
        .map((room) => (
          <ChatHistoryItem
            key={room.id}
            chatRoom={room}
            highlightedText={search}
          />
        ))}
    </ScrollArea>
  );
};

export default PreviousChats;
