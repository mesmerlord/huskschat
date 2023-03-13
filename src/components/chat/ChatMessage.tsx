import {
  ActionIcon,
  Alert,
  Avatar,
  Collapse,
  Container,
  Group,
  Loader,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import React, { useEffect, useState } from "react";
import { ChatCompletionRequestMessageRoleEnum } from "./ChatRoom";
import Link from "next/link";
import { Prism } from "@mantine/prism";
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
  dayjs.extend(calendar);
  const [hovered, setHovered] = useState(false);

  const codeRegex = /```(?:.*)\n([\s\S]*?)\n```/;
  const codeChunks = content.split(codeRegex);

  const textChunks = codeChunks.map((chunk, index) => {
    if (index % 2 === 1) {
      return <Prism key={index}>{chunk}</Prism>;
    } else {
      return <Text key={index}>{chunk}</Text>;
    }
  });

  return (
    <>
      <Group position={messagePosition()} align="flex-end" noWrap>
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
          <Container>{textChunks}</Container>
        </Stack>
      </Group>
    </>
  );
};

export default React.memo(ChatMessage);
