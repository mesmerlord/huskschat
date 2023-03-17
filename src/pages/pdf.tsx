import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
// import { Document, Page } from "react-pdf";
import jsPDF from "jspdf";
import { Box, Container } from "@mantine/core";

const MarkdownToPdf = () => {
  const [markdown, setMarkdown] = useState("# Hello, world!");
  const documentRef = useRef(null);
  const handleGeneratePdf = () => {
    const doc = new jsPDF("p", "px", "a4");

    // Adding the fonts.
    doc.setFont("Arial", "normal");
    doc.setFontSize(10);

    doc.html(documentRef.current, {
      width: 500,
      windowWidth: 600,
      margin: [20, 20, 20, 40],

      async callback(doc) {
        await doc.save("document.pdf");
      },
      html2canvas: { scale: 0.25 },
    });
  };

  return (
    <div>
      <div>
        <textarea
          value={markdown}
          onChange={(e) => {
            setMarkdown(e.target.value);
          }}
        />
        <button onClick={handleGeneratePdf}>Generate PDF</button>
        <Container ref={documentRef}>
          <div style={{ display: "inline-block" }}>
            <Box
              sx={{
                width: "500px",
                h1: {
                  fontSize: "0.5rem",
                  fontWeight: "bold",
                },
              }}
            >
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      {...props}
                      style={{ fontSize: "0.5rem", fontWeight: "bold" }}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p {...props} style={{ fontSize: "0.5rem" }} />
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            </Box>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default MarkdownToPdf;
