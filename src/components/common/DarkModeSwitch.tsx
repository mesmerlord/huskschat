import { useStore } from "@/store/store";
import { ActionIcon, Button } from "@mantine/core";

const DarkModeSwitch = () => {
  const switchDarkMode = useStore((state) => state.switchDarkMode);
  const darkMode = useStore((state) => state.darkMode);
  return (
    <Button onClick={() => switchDarkMode()}>
      {darkMode === "dark" ? "☀️" : "🌙"}
    </Button>
  );
};

export default DarkModeSwitch;
