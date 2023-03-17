import { useStore } from "@/store/store";
import {
  Avatar,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";

const DocumentChatMessage = ({ message }) => {
  const darkMode = useStore((state) => state.darkMode);

  return (
    <Card
      sx={(theme) => ({
        "&:hover": {
          filter: darkMode === "dark" ? "brightness(125%)" : "none",
        },

        marginBottom: "1rem",
        backgroundColor: darkMode === "dark" ? "rgb(59 130 246)" : "#0070ff",

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
        <Stack spacing={2} p={1}>
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
          </Avatar>
        </Stack>
        <Container
          sx={(theme) => ({
            [theme.fn.smallerThan("md")]: {
              padding: "0.1rem",
            },
          })}
          ml={0}
          mr="auto"
        >
          <Text
            sx={(theme) => ({
              color:
                darkMode === "light" && role === "assistant"
                  ? "black"
                  : "white",
            })}
          >
            {message}
          </Text>
        </Container>
      </Group>
    </Card>
  );
};

export default DocumentChatMessage;
