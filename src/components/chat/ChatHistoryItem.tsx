import { useStore } from "@/store/store";
import { Box, Group, Text } from "@mantine/core";

const ChatHistoryItem = ({ chatRoom }) => {
  const setCurrentRoomId = useStore((state) => state.setCurrentRoomId);
  return (
    <Box
      onClick={() => {
        setCurrentRoomId(chatRoom.id);
      }}
    >
      <Group>
        <Text>{chatRoom?.messages[1].content}</Text>
      </Group>
    </Box>
  );
};

export default ChatHistoryItem;
