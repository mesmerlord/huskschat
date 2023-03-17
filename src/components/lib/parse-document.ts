import { Document } from "langchain/document";
import { BufferLoader } from "./buffer-loader";

export class PDFLoader extends BufferLoader {
  public async parse(
    raw: Buffer,
    metadata: Document["metadata"]
  ): Promise<Document[]> {
    const { pdf } = await PDFLoaderImports();
    const parsed = await pdf(raw);

    const documents = [];
    const estimatedCharsPerPage = Math.ceil(
      parsed.text.length / parsed.numpages
    );

    for (let pageIndex = 0; pageIndex < parsed.numpages; pageIndex++) {
      const startIndex = pageIndex * estimatedCharsPerPage;
      const endIndex = (pageIndex + 1) * estimatedCharsPerPage;
      const pageContent = parsed.text.slice(startIndex, endIndex);

      const document = new Document({
        pageContent: pageContent,
        metadata: {
          ...metadata,
          pdf: {
            info: parsed.info,
            metadata: parsed.metadata,
            numpages: parsed.numpages,
            currentPage: pageIndex + 1,
          },
        },
      });
      documents.push(document);
    }

    return documents;
  }
}

async function PDFLoaderImports() {
  try {
    // the main entrypoint has some debug code that we don't want to import
    const { default: pdf } = await import("pdf-parse/lib/pdf-parse.js");
    return { pdf };
  } catch (e) {
    console.error(e);
    throw new Error(
      "Failed to load pdf-parse. Please install it with eg. `npm install pdf-parse`."
    );
  }
}
