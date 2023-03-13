import { useStore } from "@/store/store";
import { Button } from "@mantine/core";

const NewChatButton = () => {
  const setCurrentRoomId = useStore((state) => state.setCurrentRoomId);
  const currentRoomId = useStore((state) => state.currentRoomId);

  return (
    <Button fullWidth onClick={() => setCurrentRoomId(null)}>
      + New Chat
    </Button>
  );
};

export default NewChatButton;
