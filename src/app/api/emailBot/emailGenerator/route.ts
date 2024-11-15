import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import Prompt from "@/db/schemas/Prompt";

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import path from "path";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import { RetrievalQAChain } from "langchain/chains";
import TrainBot from "@/db/schemas/TrainBot";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// PROMPT
// Here is the Job description:
// {{jobDescription}}

// based on the provided data about user and job description write an amazing cover letter.

// The answer must be formatted and returned as HTML
export const maxDuration = 300; // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic";

export async function POST(req: any) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { result: "Not Authorised", success: false },
      { status: 401 }
    );
  }

  try {
    const reqBody = await req.json();
    const type = reqBody.type;
    const userData = reqBody.userData;
    const email = reqBody.email;
    const file = reqBody.file;
    const jobDescription = reqBody.jobDescription;
    const trainBotData = reqBody.trainBotData;

    // fetch prompt from db
    const promptRec = await Prompt.findOne({
      type: "email",
      name: "emailWriter",
      active: true,
    });
    const promptDB = promptRec.value;

    const prompt = promptDB.replace("{{jobDescription}}", jobDescription);

    // CREATING LLM MODAL
    const model = new ChatOpenAI({
      streaming: true,
      modelName: "gpt-3.5-turbo",
      //   callbacks: [
      //     {
      //       handleLLMNewToken(token) {
      //         res.write(token);
      //       },
      //     },
      //   ],
      temperature: 0.5,
    });

    if (type === "file") {
      const dir = path.join(
        process.cwd() + "/public",
        "/files",
        "/userResumes",
        `/${email}`,
        `/${file}`
      );

      const loader = new PDFLoader(dir);

      const docs = await loader.load();

      const vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        new OpenAIEmbeddings()
      );

      const vectorStoreRetriever = vectorStore.asRetriever();

      const chain4 = RetrievalQAChain.fromLLM(model, vectorStoreRetriever);
      await chain4.call({ query: prompt });

      //   res.end();
    } else {
      // this will run for both TYPES aiResume and profile
      const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(`You are a helpful assistant that Reads the Resume data of a person and helps Writing Personalized Email for the person.
          Following are the content of the resume (in JSON format): 
          JSON user/resume data: {userData}
          `),
        HumanMessagePromptTemplate.fromTemplate("{prompt}"),
      ]);
      const chainB = new LLMChain({
        prompt: chatPrompt,
        llm: model,
      });

      const resp = await chainB.call({
        userData: JSON.stringify(userData),
        prompt,
      });

      // make a trainBot entry
      try {
        if (trainBotData) {
          const obj = {
            type: "email.followupSequence",
            input: prompt,
            output: resp.text.replace(/(\r\n|\n|\r)/gm, ""),
            idealOutput: "",
            status: "pending",
            userEmail: trainBotData.userEmail,
            fileAddress: trainBotData.fileAddress,
            Instructions: `Email Followup Sequence for ${trainBotData.userEmail}`,
          };

          await TrainBot.create({ ...obj });
        }
      } catch (error) {}

      return NextResponse.json(
        { result: resp.text.replace(/(\r\n|\n|\r)/gm, ""), success: true },
        { status: 200 }
      );
      //   res.end();
    }
  } catch (error) {
    return NextResponse.json(
      { result: "something went wrong", success: false },
      { status: 404 }
    );
  }
}
