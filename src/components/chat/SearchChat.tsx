import { Box, TextInput } from "@mantine/core";

interface SearchChatProps {
  setSearch: (search: string) => void;
}

const SearchChat = ({ setSearch }: SearchChatProps) => {
  return (
    <Box sx={{ marginBottom: "10px" }}>
      <TextInput
        placeholder="Search"
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
    </Box>
  );
};

export default SearchChat;
