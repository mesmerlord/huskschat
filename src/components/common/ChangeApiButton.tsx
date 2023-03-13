import { useStore } from "@/store/store";
import { Button } from "@mantine/core";
import { useState } from "react";
import ChangeApiModal from "./ChangeApiModal";

const ChangeApiButton = () => {
  const apiKey = useStore((state) => state.apiKey);

  const [opened, setOpened] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          setOpened(true);
        }}
      >
        {apiKey === "" ? "Set API Key" : "Change API Key"}
      </Button>
      <ChangeApiModal opened={opened} setOpened={setOpened} />
    </>
  );
};

export default ChangeApiButton;
