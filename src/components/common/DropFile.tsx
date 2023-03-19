import { Group, Text, useMantineTheme, rem } from "@mantine/core";
import { Dropzone, DropzoneProps, PDF_MIME_TYPE } from "@mantine/dropzone";
import axios from "axios";

interface DropFileProps {
  onFileUpload: (res) => void;
}

const Dropfile = ({ onFileUpload }: DropFileProps) => {
  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const response = await axios
        .post("/api/vector", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          console.log(res);
          onFileUpload(res);
        });
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <Dropzone
      onDrop={(files) => {
        console.log("accepted files", files);
        handleUpload(files);
      }}
      onReject={(files) => console.log("rejected files", files)}
      maxSize={3 * 1024 ** 2}
    >
      <Group position="center">
        <Text size="xl">Drag and drop your PDF file here</Text>
      </Group>
    </Dropzone>
  );
};

export default Dropfile;
