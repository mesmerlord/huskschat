import { Box } from "@mantine/core";
import NewChatButton from "./NewChatButton";
import SearchChat from "./SearchChat";

interface TopSectionChatProps {
  setSearch: (search: string) => void;
}

const TopSectionChat = ({ setSearch }: TopSectionChatProps) => {
  return (
    <Box>
      <SearchChat setSearch={setSearch} />
      <NewChatButton />
    </Box>
  );
};

export default TopSectionChat;
