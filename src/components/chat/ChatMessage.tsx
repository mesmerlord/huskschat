import {
  ActionIcon,
  Alert,
  Avatar,
  Card,
  Collapse,
  Container,
  Group,
  Loader,
  Menu,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import React, { useEffect, useState } from "react";
import { ChatCompletionRequestMessageRoleEnum } from "./ChatRoom";
import Link from "next/link";
import { Prism } from "@mantine/prism";
import { useStore } from "@/store/store";
interface ChatMessageProps {
  id: string;
  content: string;
  role: typeof ChatCompletionRequestMessageRoleEnum[keyof typeof ChatCompletionRequestMessageRoleEnum];
}
const ChatMessage = ({ id, content, role }: ChatMessageProps) => {
  const darkMode = useStore((state) => state.darkMode);

  const messageColor = (theme) => {
    switch (role) {
      case "user":
        return darkMode === "dark" ? "rgb(59 130 246)" : "#0070ff";
      case "assistant":
        return darkMode === "dark" ? theme.colors.gray[8] : "white";
      default:
        return "#67b3ff";
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
      return (
        <Text
          key={index}
          sx={(theme) => ({
            color:
              darkMode === "light" && role === "assistant" ? "black" : "white",
          })}
        >
          {chunk}
        </Text>
      );
    }
  });

  return (
    <>
      <Card
        sx={(theme) => ({
          "&:hover": {
            filter: darkMode === "dark" && "brightness(125%)",
            backgroundColor:
              darkMode === "light" &&
              role === "assistant" &&
              "rgba(255, 255, 255, 0.15)",
          },
          marginBottom: "1rem",
          backgroundColor: messageColor(theme),
        })}
        shadow="sm"
      >
        <Group align="flex-end" noWrap sx={{}}>
          <Stack p={0} spacing={2} sx={{ maxWidth: "80%" }} align="flex-end">
            <Group align="flex-end" spacing="xs">
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
      </Card>
    </>
  );
};

export default React.memo(ChatMessage);
