import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Background from "../background/Background";
import ProgressLoading from "../../components/background/ProgressLoading";
import Seo from "../common/Seo";
import { AppShell, Navbar, Header } from "@mantine/core";
import PreviousChats from "../chat/PreviousChats";

interface LayoutProps {
  component: any;
  children: React.ReactNode;
}

const Layout = ({ component, children }: LayoutProps) => {
  const description =
    "Husks is a free interface to interact with OpenAI's ChatGPT API.";
  const tagLine =
    "Husks is a free interface to interact with OpenAI's ChatGPT API.";
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
        image={""}
      />

      <Background>
        <ProgressLoading
          isRouteChanging={state.isRouteChanging}
          key={state.loadingKey}
        />

        <AppShell
          padding="md"
          navbar={
            <Navbar width={{ base: 300 }} height={500} p="xs">
              <PreviousChats />
            </Navbar>
          }
          header={
            <Header height={60} p="xs">
              {/* Header content */}
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
