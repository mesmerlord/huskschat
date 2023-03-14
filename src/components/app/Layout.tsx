import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Background from "../background/Background";
import ProgressLoading from "../../components/background/ProgressLoading";
import Seo from "../common/Seo";
import {
  AppShell,
  Navbar,
  Header,
  Stack,
  Title,
  Box,
  Group,
  Grid,
  Col,
  Center,
} from "@mantine/core";
import PreviousChats from "../chat/PreviousChats";
import NewChatButton from "../chat/NewChatButton";
import DarkModeSwitch from "../common/DarkModeSwitch";
import ChangeApiButton from "../common/ChangeApiButton";
import TokenUsed from "../common/TokenUsed";

interface LayoutProps {
  component: any;
  children: React.ReactNode;
}

const Layout = ({ component, children }: LayoutProps) => {
  const description =
    "Revamp your ChatGPT conversations with seamless UI experience.";
  const tagLine = "Husks: Own your conversations with ChatGPT";
  const router = useRouter();
  //   const analytics = useAnalytics({ pathname: router.pathname });

  const [state, setState] = useState({
    isRouteChanging: false,
    loadingKey: 0,
  });

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setState((prevState) => ({
        ...prevState,
        isRouteChanging: true,
        loadingKey: prevState.loadingKey ^ 1,
      }));
    };

    const handleRouteChangeEnd = () => {
      setState((prevState) => ({
        ...prevState,
        isRouteChanging: false,
      }));
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeEnd);
    router.events.on("routeChangeError", handleRouteChangeEnd);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeEnd);
      router.events.off("routeChangeError", handleRouteChangeEnd);
    };
  }, [router.events]);

  // @ts-ignore
  const getLayout = component.getLayout || ((page) => page);

  return getLayout(
    <>
      <Seo
        description={description}
        url={`https://husks.org`}
        title={tagLine}
        image={"OgImage.png"}
      />

      <Background>
        <ProgressLoading
          isRouteChanging={state.isRouteChanging}
          key={state.loadingKey}
        />

        <AppShell
          padding="md"
          navbar={
            <Navbar width={{ base: 300 }} height={750} p="xs">
              <Navbar.Section>
                <NewChatButton />
              </Navbar.Section>
              <Navbar.Section mt="md" grow>
                <Box sx={{ height: "300px" }}>
                  <PreviousChats />
                </Box>
              </Navbar.Section>
              <Navbar.Section>
                <Stack>
                  <ChangeApiButton />
                  <DarkModeSwitch />
                </Stack>
              </Navbar.Section>
            </Navbar>
          }
          header={
            <Header height={60} p="xs">
              <Grid>
                <Col span={4}>
                  <Title order={3}>🌽Husk Chat</Title>
                </Col>
                <Col span={6}>
                  <Center>
                    <TokenUsed />
                  </Center>
                </Col>
              </Grid>
            </Header>
          }
          styles={(theme) => ({
            main: {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[8]
                  : theme.colors.gray[0],
            },
          })}
        >
          {children}
        </AppShell>
      </Background>
    </>
  );
};

export default Layout;
