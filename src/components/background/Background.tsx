import { Paper } from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useStore } from "../../store/store";

const Background = (props) => {
  const apiKey = useStore((state) => state.apiKey);
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Notifications />
      <Paper
        radius={0}
        sx={(theme) => ({
          backgroundColor:
            theme.colorScheme == "light"
              ? theme.colors.gray[1]
              : theme.colors.dark[4],
          minHeight: "90vh",
        })}
      >
        {props.children}
      </Paper>
    </MantineProvider>
  );
};

export default Background;
