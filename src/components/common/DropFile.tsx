import { Group, Text, useMantineTheme, rem } from "@mantine/core";
import { Dropzone, DropzoneProps, PDF_MIME_TYPE } from "@mantine/dropzone";
import axios from "axios";

const Dropfile = (props: Partial<DropzoneProps>) => {
  const theme = useMantineTheme();

  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const response = await axios.post("/api/vector", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload successful:", response);
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
      accept={PDF_MIME_TYPE}
      {...props}
    >
      {/* ... (rest of the code) */}
    </Dropzone>
  );
};

export default Dropfile;
