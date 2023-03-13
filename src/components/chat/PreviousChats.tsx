import { useStore } from "@/store/store";
import { Box } from "@mantine/core";
import ChatHistoryItem from "./ChatHistoryItem";

const PreviousChats = () => {
  const messageRoomList = useStore((state) => state.messageRoomList);

  return (
    <>
      <Box>
        {messageRoomList.map((room) => (
          <ChatHistoryItem key={room.id} chatRoom={room} />
        ))}
      </Box>
    </>
  );
};

export default PreviousChats;
