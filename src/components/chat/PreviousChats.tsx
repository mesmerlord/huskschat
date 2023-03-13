import { useStore } from "@/store/store";
import { Box, ScrollArea } from "@mantine/core";
import ChatHistoryItem from "./ChatHistoryItem";

const PreviousChats = () => {
  const messageRoomList = useStore((state) => state.messageRoomList);

  return (
    <ScrollArea h={500} type="always">
      {messageRoomList
        .slice()
        .reverse()
        .map((room) => (
          <ChatHistoryItem key={room.id} chatRoom={room} />
        ))}
    </ScrollArea>
  );
};

export default PreviousChats;
