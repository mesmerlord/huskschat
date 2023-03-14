import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Container,
  Group,
  Menu,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import React, { useEffect, useRef, useState } from "react";
import { ChatCompletionRequestMessageRoleEnum } from "./ChatRoom";
import Link from "next/link";
import { Prism } from "@mantine/prism";
import { useStore } from "@/store/store";
import ReactMarkdown from "react-markdown";
import {
  IconRobot,
  IconBookDownload,
  IconDotsVertical,
} from "@tabler/icons-react";
import jsPDF from "jspdf";

interface ChatMessageProps {
  id: string;
  content: string;
  role: typeof ChatCompletionRequestMessageRoleEnum[keyof typeof ChatCompletionRequestMessageRoleEnum];
}
const ChatMessage = ({ id, content, role }: ChatMessageProps) => {
  const darkMode = useStore((state) => state.darkMode);
  const documentRef = useRef(null);

  const handleGeneratePdf = () => {
    const doc = new jsPDF("p", "px", "a4");

    doc.setFontSize(10);

    // Adding the fonts.
    doc.setFont("Arial", "normal");

    doc.html(documentRef.current, {
      width: 400,
      windowWidth: 800,
      x: 10,
      y: 10,

      async callback(doc) {
        await doc.save("document.pdf");
      },
    });
  };

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
          <ReactMarkdown>{chunk}</ReactMarkdown>
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
        <Group align="flex-start" noWrap>
          <Stack spacing={2}>
            <Avatar>{role === "assistant" && <IconRobot />}</Avatar>
            {role === "assistant" && (
              <Title
                align="center"
                order={6}
                sx={(theme) => ({
                  color: darkMode === "light" ? "black" : "white",
                })}
              >
                AI
              </Title>
            )}
            {role === "user" && (
              <Title align="center" order={6} color="white">
                YOU
              </Title>
            )}
          </Stack>
          <Stack p={0} spacing={2} sx={{ maxWidth: "80%" }} align="flex-end">
            <Container ref={documentRef}>{textChunks}</Container>
          </Stack>
          <Menu shadow="md" width={200} ml="auto" withinPortal>
            <Menu.Target>
              <ActionIcon>
                <IconDotsVertical />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Options</Menu.Label>
              <Menu.Item
                onClick={handleGeneratePdf}
                icon={<IconBookDownload size={14} />}
              >
                Download As PDF
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Card>
    </>
  );
};

export default React.memo(ChatMessage);
