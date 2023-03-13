import {
  ActionIcon,
  Box,
  Button,
  Center,
  Col,
  Container,
  Flex,
  Grid,
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
      <Container>
        <Box sx={{ width: "100%", marginLeft: "auto", marginRight: "auto" }}>
          <Grid grow>
            <Col span={10}>
              <Textarea
                sx={{ width: "99%" }}
                minRows={2}
                maxRows={10}
                autosize
                placeholder="Type your message"
                value={message}
                onChange={(event) => setMessage(event.currentTarget.value)}
              />
            </Col>
            <Col span={1}>
              <Flex justify="center" align="flex-end" sx={{ height: "100%" }}>
                <Button
                  onClick={onMessageSubmit}
                  leftIcon={
                    <ActionIcon variant="transparent" size="sm">
                      <IconSend color="white" />
                    </ActionIcon>
                  }
                >
                  Send
                </Button>
              </Flex>
            </Col>
          </Grid>
        </Box>
      </Container>
    </form>
  );
};

export default ChatBox;
