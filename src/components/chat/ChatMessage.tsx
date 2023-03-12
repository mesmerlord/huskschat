import {
  ActionIcon,
  Alert,
  Avatar,
  Collapse,
  Group,
  Loader,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import { useEffect, useState } from "react";
import { ChatCompletionRequestMessageRoleEnum } from "./ChatRoom";
import Link from "next/link";
import { IconCornerUpLeft } from "@tabler/icons-react";

interface ChatMessageProps {
  id: string;
  content: string;
  role: typeof ChatCompletionRequestMessageRoleEnum[keyof typeof ChatCompletionRequestMessageRoleEnum];
}
const ChatMessage = ({ id, content, role }: ChatMessageProps) => {
  const messagePosition = () => {
    switch (role) {
      case "system":
        return "center";
      case "user":
        return "right";
      case "assistant":
        return "left";
      default:
        return "center";
    }
  };
  let color;
  dayjs.extend(calendar);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <Group
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        position={messagePosition()}
        align="flex-end"
        noWrap
      >
        <Stack p={0} spacing={2} sx={{ maxWidth: "80%" }} align="flex-end">
          <Group position={messagePosition()} align="flex-end" spacing="xs">
            <Stack p={0} spacing={0} m={0}>
              <Stack
                p={0}
                spacing={0}
                m={0}
                // hidden={
                //   deleted === undefined
                //     ? repliedTo === undefined
                //       ? true
                //       : false
                //     : true
                // }
              ></Stack>
            </Stack>
          </Group>
          <Text size="xs" align={messagePosition()} color="dimmed">
            {content}
          </Text>
        </Stack>
      </Group>
    </>
  );
};

export default ChatMessage;
