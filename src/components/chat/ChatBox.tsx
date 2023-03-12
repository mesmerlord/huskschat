import {
  ActionIcon,
  Box,
  Container,
  Flex,
  Group,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { useState } from "react";

interface ChatBoxProps {
  onMessageSubmit: () => void;
  message: string;
  setMessage: (value: string) => void;
}

const ChatBox = ({ onMessageSubmit, message, setMessage }: ChatBoxProps) => {
  return (
    <form>
      <Group grow>
        <Textarea
          sx={{ width: "100%" }}
          minRows={2}
          autosize
          placeholder="Type your message"
          value={message}
          onChange={(event) => setMessage(event.currentTarget.value)}
          rightSection={
            <ActionIcon
              onClick={onMessageSubmit}
              variant="transparent"
              color="gray"
              size="sm"
            >
              <IconSend />
            </ActionIcon>
          }
        />
      </Group>
    </form>
  );
};

export default ChatBox;
