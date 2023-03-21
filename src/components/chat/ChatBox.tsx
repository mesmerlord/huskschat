import { useStore } from "@/store/store";
import {
  ActionIcon,
  Box,
  Button,
  Col,
  Container,
  Flex,
  Grid,
  Select,
  Textarea,
} from "@mantine/core";
import { IconBookUpload, IconSend } from "@tabler/icons-react";

interface ChatBoxProps {
  onMessageSubmit: () => void;
  message: string;
  setMessage: (value: string) => void;
  setShowDropBox: (value: boolean) => void;
  showUploadButton: boolean;
}

const ChatBox = ({
  onMessageSubmit,
  message,
  setMessage,
  setShowDropBox,
  showUploadButton,
}: ChatBoxProps) => {
  const modelName = useStore((state) => state.modelName);
  const setModelName = useStore((state) => state.setModelName);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onMessageSubmit();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onMessageSubmit();
        }
      }}
    >
      <Container>
        <Box sx={{ width: "100%", marginLeft: "auto", marginRight: "auto" }}>
          <Grid grow>
            <Col span={9}>
              <Textarea
                sx={{ width: "99%" }}
                minRows={1}
                maxRows={10}
                autosize
                placeholder="Type your message"
                value={message}
                onChange={(event) => setMessage(event.currentTarget.value)}
                size="lg"
              />
            </Col>
            <Col span={3}>
              <Flex justify="center" align="flex-start" sx={{ height: "100%" }}>
                <Select
                  data={[
                    { label: "GPT-3 Turbo", value: "gpt-3.5-turbo-0301" },
                    { label: "ChatGLM", value: "chatglm" },
                  ]}
                  size="sm"
                  px={5}
                  value={modelName}
                  onChange={(value) => {
                    setModelName(value);
                  }}
                />
                {showUploadButton && (
                  <Button
                    onClick={() => setShowDropBox((value) => !value)}
                    leftIcon={
                      <ActionIcon variant="transparent" size="sm">
                        <IconBookUpload />
                      </ActionIcon>
                    }
                  >
                    Upload
                  </Button>
                )}
                <Button
                  type="submit"
                  leftIcon={
                    <ActionIcon variant="transparent" size="sm">
                      <IconSend color="white" />
                    </ActionIcon>
                  }
                  sx={{ marginLeft: "0.5rem" }}
                >
                  Send
                </Button>{" "}
              </Flex>
            </Col>
          </Grid>
        </Box>
      </Container>
    </form>
  );
};

export default ChatBox;
