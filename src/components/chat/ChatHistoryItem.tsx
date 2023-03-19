import { useStore } from "@/store/store";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Highlight,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useMemo, useState } from "react";

type ConfirmType = {
  name: "delete" | "edit" | "none";
};

interface ChatHistoryItemProps {
  chatRoom: any;
  highlightedText: string;
}

const ChatHistoryItem = ({
  chatRoom,
  highlightedText,
}: ChatHistoryItemProps) => {
  const setCurrentRoomId = useStore((state) => state.setCurrentRoomId);
  const currentRoomId = useStore((state) => state.currentRoomId);
  const setRoomName = useStore((state) => state.setRoomName);
  const deleteRoom = useStore((state) => state.deleteRoom);

  const [currentRoomName, setCurrentRoomName] = useState(chatRoom.name);

  const [showConfirm, setShowConfirm] = useState<ConfirmType>({ name: "none" });

  const messageHighlighted = useMemo(() => {
    if (highlightedText) {
      try {
        const messageContent = chatRoom?.messages[1]?.content;
        const highlightedIndex =
          highlightedText?.split(" ")?.length > 1
            ? messageContent?.indexOf(highlightedText)
            : messageContent?.indexOf(highlightedText?.split(" ")[0]);
        if (!highlightedIndex) {
          return chatRoom?.messages[1]?.content;
        }
        const highlightedMessage = messageContent?.substring(
          Math.max(0, highlightedIndex - 10)
        );
        return highlightedMessage;
      } catch (e) {
        console.log(e);
        return null;
      }
    }
    return null;
  }, [chatRoom, highlightedText]);

  const confirmDelete = () => {
    setShowConfirm({ name: "delete" });
  };
  const confirmEdit = () => {
    if (showConfirm.name === "edit") {
      setShowConfirm({ name: "none" });
    } else {
      setShowConfirm({ name: "edit" });
    }
  };

  const ConfirmComponent = () => {
    switch (showConfirm.name) {
      case "delete":
        return (
          <Button
            onClick={() => {
              deleteRoom(chatRoom?.id);
            }}
            compact
          >
            You Sure?
          </Button>
        );

      default:
        return <></>;
    }
  };

  return (
    <Box
      onClick={() => {
        setCurrentRoomId(chatRoom.id);
      }}
      sx={{
        cursor: "pointer",
      }}
    >
      <Card
        p="xs"
        m="xs"
        shadow={"sm"}
        sx={(theme) => ({
          backgroundColor:
            currentRoomId === chatRoom.id ? "gray" : "light blue",
          "&:hover": {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[1],
          },
        })}
      >
        <Stack spacing={1}>
          <Group noWrap position="apart" spacing={1}>
            {showConfirm.name === "edit" ? (
              <Group noWrap position="apart" spacing={1}>
                <TextInput
                  value={currentRoomName}
                  onChange={(e) => {
                    setCurrentRoomName(e.currentTarget.value);
                  }}
                />
                <ActionIcon
                  onClick={() => {
                    setRoomName(chatRoom?.id, currentRoomName);
                    setShowConfirm({ name: "none" });
                  }}
                  // compact
                  size="xs"
                >
                  ✔
                </ActionIcon>
              </Group>
            ) : (
              <>
                {highlightedText ? (
                  <Highlight highlight={highlightedText} lineClamp={1}>
                    {chatRoom.name}
                  </Highlight>
                ) : (
                  <Text lineClamp={1}>{chatRoom.name}</Text>
                )}
              </>
            )}
            <Box>
              {showConfirm.name === "delete" ? (
                ConfirmComponent()
              ) : (
                <Group noWrap position="right" spacing={0}>
                  <ActionIcon onClick={confirmEdit}>
                    <IconEdit />
                  </ActionIcon>

                  <ActionIcon onClick={confirmDelete}>
                    <IconTrash />
                  </ActionIcon>
                </Group>
              )}
            </Box>
          </Group>
          {messageHighlighted ? (
            <Highlight highlight={highlightedText} lineClamp={1} size="xs">
              {messageHighlighted}
            </Highlight>
          ) : (
            <Text size="xs" lineClamp={1}>
              {chatRoom?.messages[1]?.content}
            </Text>
          )}
        </Stack>
      </Card>
    </Box>
  );
};

export default ChatHistoryItem;
