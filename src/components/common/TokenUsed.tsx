import { useStore } from "@/store/store";
import { Stack, Text, Title } from "@mantine/core";

const TokenUsed = () => {
  const messageRoomList = useStore((state) => state.messageRoomList);

  const totalTokensUsed = messageRoomList.reduce(
    (total, room) => total + room.tokensUsed,
    0
  );
  const totalMessages = messageRoomList.reduce(
    (total, room) => total + room?.messages?.length,
    0
  );
  return (
    <>
      <Stack spacing={2}>
        <Title align="center" order={4}>
          {totalTokensUsed} Tokens Used
        </Title>
        <Title sx={{ fontSize: "13px", fontWeight: 500 }} align="center">
          {totalMessages} Messages ( ~ $
          {Math.round((totalMessages / 1000) * 0.0002 * 1000000) / 1000000})
        </Title>
      </Stack>
    </>
  );
};

export default TokenUsed;