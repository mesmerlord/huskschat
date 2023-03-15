import { useStore } from "@/store/store";
import {
  Button,
  Container,
  Divider,
  Group,
  Modal,
  PasswordInput,
  Text,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { Configuration, OpenAIApi } from "openai";

const ChangeApiModal = ({ opened, setOpened }) => {
  const setApiKey = useStore((state) => state.setApiKey);
  const apiKey = useStore((state) => state.apiKey);
  const setUserPlan = useStore((state) => state.setUserPlan);
  const userPlan = useStore((state) => state.userPlan);

  const [newApiKey, setNewApiKey] = useState(apiKey);
  const [error, setError] = useState("");

  const checkApiKey = async () => {
    const configuration = new Configuration({
      apiKey: newApiKey,
    });
    const openai = new OpenAIApi(configuration);
    await openai
      .retrieveModel("text-davinci-003")
      .then((data) => {
        setApiKey(newApiKey);
        setOpened(false);
        setError("");
      })
      .catch((err) => {
        setError("Invalid API Key");
      });
  };
  return (
    <Modal opened={opened} onClose={() => setOpened(false)} centered>
      <Title
        align="center"
        order={3}
        sx={{
          marginBottom: "20px",
        }}
      >
        {apiKey === "" ? "No API Key Set" : "Set New API Key"}
      </Title>
      <Container>
        <Container sx={{ marginBottom: "20px" }}>
          <Text py={10}>
            To use the OpenAI API, you need to set an API key. You can get one
            from{" "}
            <a
              href="https://platform.openai.com/account/api-keys"
              target="_blank"
              rel="noreferrer"
            >
              OpenAI's website
            </a>
            .
          </Text>
          <Text>
            Rest assured that your API key is always securely stored on your
            browser and never leaves your device.
          </Text>
        </Container>
        <Group noWrap grow>
          <PasswordInput
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.currentTarget.value)}
            error={error}
          />
          <Button onClick={checkApiKey} disabled={newApiKey === ""}>
            Set API Key
          </Button>
        </Group>
        <Divider
          my="xs"
          label={
            <>
              <Text size="lg">Or Try For Free</Text>
            </>
          }
          labelPosition="center"
        />
        <Container sx={{ marginBottom: "20px" }}>
          <Text py={10}>
            The messages you send using this will be proxied through our API
            keys.
          </Text>

          <Button
            fullWidth
            onClick={() => {
              setUserPlan("free");
              setOpened(false);
            }}
          >
            {userPlan === "free" ? "Already on Free Plan" : "Try For Free"}
          </Button>
        </Container>
      </Container>
    </Modal>
  );
};

export default ChangeApiModal;
