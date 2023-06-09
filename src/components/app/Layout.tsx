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
  MediaQuery,
  Grid,
  Col,
  Center,
  Burger,
  Text,
  useMantineTheme,
  Drawer,
  Group,
  Button,
} from "@mantine/core";
import PreviousChats from "../chat/PreviousChats";
import DarkModeSwitch from "../common/DarkModeSwitch";
import ChangeApiButton from "../common/ChangeApiButton";
import TokenUsed from "../common/TokenUsed";
import { useDebouncedState, useDisclosure } from "@mantine/hooks";
import TopSectionChat from "../chat/TopSectionChat";
import { useSession, signOut } from "next-auth/react";

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
  const { data: session, status } = useSession();

  const [state, setState] = useState({
    isRouteChanging: false,
    loadingKey: 0,
  });

  const [opened, { open, close }] = useDisclosure(false);

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
  const theme = useMantineTheme();

  const [search, setSearch] = useDebouncedState("", 200);

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
          navbarOffsetBreakpoint="sm"
          navbar={
            <Navbar
              p="xs"
              hiddenBreakpoint="sm"
              hidden={true}
              width={{ base: 300, sm: 300, lg: 300, xs: 150 }}
            >
              <Navbar.Section>
                <TopSectionChat setSearch={setSearch} />
              </Navbar.Section>
              <Navbar.Section mt="md" grow>
                <Box sx={{ height: "300px" }}>
                  <PreviousChats search={search} />
                </Box>
              </Navbar.Section>
              <Navbar.Section>
                <Stack>
                  <ChangeApiButton />
                  <Group grow>
                    <DarkModeSwitch />
                    {session && (
                      <Button onClick={() => signOut()}>
                        <Text> Logout</Text>
                      </Button>
                    )}
                    {!session && (
                      <Button onClick={() => router.push("/login")}>
                        <Text>Login</Text>
                      </Button>
                    )}
                  </Group>
                </Stack>
              </Navbar.Section>
            </Navbar>
          }
          header={
            <Header height={{ base: 70, md: 90, lg: 70 }} p="xs">
              <Grid>
                <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                  <Col span={2}>
                    <Burger
                      opened={opened}
                      onClick={open}
                      size="sm"
                      color={theme.colors.gray[6]}
                      mr="xl"
                    />
                  </Col>
                </MediaQuery>

                <Col span={4}>
                  <Title
                    order={3}
                    sx={(theme) => ({
                      [theme.fn.smallerThan("md")]: { fontSize: "18px" },
                    })}
                  >
                    🌽Husks Chat
                  </Title>
                </Col>
                <Col span={5}>
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
          <Drawer
            opened={opened}
            onClose={close}
            title="Menu"
            overlayProps={{ opacity: 0.5, blur: 4 }}
            size="75%"
          >
            <Stack>
              <TopSectionChat setSearch={setSearch} />

              <Box sx={{ height: "500px" }}>
                <PreviousChats search={search} />
              </Box>
              <Stack>
                <ChangeApiButton />
                <Group grow>
                  <DarkModeSwitch />
                  {session && (
                    <Button onClick={() => signOut()}>
                      <Text> Logout</Text>
                    </Button>
                  )}
                  {!session && (
                    <Button onClick={() => router.push("/login")}>
                      <Text>Login</Text>
                    </Button>
                  )}
                </Group>
              </Stack>
            </Stack>
          </Drawer>
          {children}
        </AppShell>
      </Background>
    </>
  );
};

export default Layout;
