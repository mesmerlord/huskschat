import ChatBox from "@/components/chat/ChatBox";
import ChatRoom from "@/components/chat/ChatRoom";
import { useStore } from "@/store/store";

export default function Home() {
  const currentRoomId = useStore((state) => state.currentRoomId);
  return (
    <>
      <ChatRoom roomId={currentRoomId} />
    </>
  );
}
