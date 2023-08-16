import { NextApiHandler } from "next";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import path from "path";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";

const handler: NextApiHandler = async (req, res) => {
  try {
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT;
    const index = process.env.PINECONE_INDEX;

    if (req.body && apiKey && environment && index) {
      const reqBody = JSON.parse(req.body);
      const email = reqBody.email;
      const dir = path.join(process.cwd() + "/public", "/files", `/${email}`);
      const loader = new DirectoryLoader(dir, {
        ".pdf": (path) => new PDFLoader(path),
      });
      const docs = await loader.load();

      // pinecone
      const client = new PineconeClient();
      await client.init({
        apiKey,
        environment,
      });
      const pineconeIndex = client.Index(index);

      await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
        pineconeIndex,
      });

      res.status(200).json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, err: err });
  }
};
export default handler;
