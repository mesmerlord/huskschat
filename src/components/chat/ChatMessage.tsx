import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Group,
  Menu,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import React, { useRef } from "react";
import { ChatCompletionRequestMessageRoleEnum } from "./ChatRoom";
import { Prism } from "@mantine/prism";
import { useStore } from "@/store/store";
import ReactMarkdown from "react-markdown";
import {
  IconRobot,
  IconBookDownload,
  IconDotsVertical,
  IconRepeat,
} from "@tabler/icons-react";
import jsPDF from "jspdf";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  id: string;
  content: string;
  role: typeof ChatCompletionRequestMessageRoleEnum[keyof typeof ChatCompletionRequestMessageRoleEnum];
  lastMessage: boolean;
  regenerateMessage: (messageId) => void;
  isSummary?: boolean;
}
const ChatMessage = ({
  id,
  content,
  role,
  lastMessage,
  regenerateMessage,
  isSummary,
}: ChatMessageProps) => {
  const darkMode = useStore((state) => state.darkMode);
  const documentRef = useRef(null);

  const handleGeneratePdf = () => {
    const doc = new jsPDF("p", "px", "a4");

    doc.setFontSize(10);

    // Adding the fonts.
    doc.setFont("Arial", "normal");

    doc.html(documentRef?.current, {
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

          [theme.fn.smallerThan("xs")]: {
            p: {
              fontSize: "0.8rem",
            },
            padding: "8px",
          },
        })}
        shadow="sm"
      >
        <Group position="left" align="flex-start" spacing={10} noWrap>
          <Stack spacing={2} padding={1}>
            <Avatar
              size="sm"
              sx={(theme) => ({
                [theme.fn.smallerThan("xs")]: {
                  width: "17px",
                  height: "17px",
                  svg: {
                    width: "17px",
                    height: "17px",
                  },
                },
              })}
            >
              {role === "assistant" && <IconRobot />}
            </Avatar>
            {role === "assistant" && (
              <Title
                align="center"
                order={6}
                sx={(theme) => ({
                  color: darkMode === "light" ? "black" : "white",
                  [theme.fn.smallerThan("xs")]: {
                    fontSize: "0.6rem",
                  },
                })}
              >
                AI
              </Title>
            )}
            {role === "user" && (
              <Title
                align="center"
                order={6}
                color="white"
                sx={(theme) => ({
                  [theme.fn.smallerThan("xs")]: {
                    fontSize: "0.6rem",
                  },
                })}
              >
                YOU
              </Title>
            )}
          </Stack>
          <Container
            ref={documentRef}
            sx={(theme) => ({
              [theme.fn.smallerThan("md")]: {
                padding: "0.1rem",
              },
            })}
            ml={0}
            mr="auto"
          >
            {isSummary && (
              <Title
                order={4}
                align="center"
                my={8}
                sx={{ fontWeight: 800, textDecoration: "underline" }}
              >
                Summarizing conversation to go over the 4000 token limit
              </Title>
            )}
            <ScrollArea>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p({ node, children, ...props }) {
                    return (
                      <Text
                        sx={(theme) => ({
                          color:
                            darkMode === "light" && role === "assistant"
                              ? "black"
                              : "white",
                        })}
                      >
                        {children}
                      </Text>
                    );
                  },

                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <Prism
                        sx={(theme) => ({
                          [theme.fn.smallerThan("xs")]: {
                            pre: {
                              overflowWrap: "break-word",
                            },
                            div: {
                              maxWidth: "100%",
                            },
                            overflow: "scroll",
                            span: {
                              fontSize: "0.7rem !important",
                            },
                          },
                        })}
                        language={match}
                      >
                        {children[0]}
                      </Prism>
                    ) : (
                      <code>"{children}"</code>
                    );
                  },
                  table({ node, children, ...props }) {
                    return (
                      <Table
                        fontSize={16}
                        striped
                        highlightOnHover
                        withBorder
                        withColumnBorders
                        sx={(theme) => ({
                          // tableLayout: "fixed",
                          textAlign: "left",
                          td: {
                            width: "5px",
                          },
                          [theme.fn.smallerThan("xs")]: {
                            width: "33%",

                            td: {
                              fontSize: "0.7rem !important",
                              padding: "0.5rem !important",
                            },
                            th: {
                              padding: "0.2rem !important",
                              fontSize: "0.7rem !important",
                            },
                          },
                          [theme.fn.smallerThan("sm")]: {
                            width: "50%",

                            td: {
                              fontSize: "0.7rem !important",
                              padding: "0.5rem !important",
                            },
                            th: {
                              padding: "0.2rem !important",
                              fontSize: "0.7rem !important",
                            },
                          },
                        })}
                      >
                        {children}
                      </Table>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </ScrollArea>
          </Container>
          <Stack p={0} spacing={2} sx={{ maxWidth: "80%" }} align="flex-end">
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
          </Stack>
        </Group>
      </Card>
      {lastMessage && role === "assistant" && (
        <Group position="center">
          <Button
            onClick={() => {
              regenerateMessage(id);
            }}
            leftIcon={<IconRepeat />}
          >
            Regenerate
          </Button>
        </Group>
      )}
    </>
  );
};

export default React.memo(ChatMessage);
