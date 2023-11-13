import { ChatOpenAI } from "langchain/chat_models/openai";
// import OpenAI from "openai";
// import Prompt from "@/db/schemas/Prompt";
// import startDB from "@/lib/db";
import type { NextRequest, NextResponse } from "next/server";
import { LLMChain } from "langchain/chains";
import { NextApiHandler } from "next";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import Prompt from "@/db/schemas/Prompt";

import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import path from "path";
import TrainBot from "@/db/schemas/TrainBot";

// export const config = {
//   runtime: "edge",
// };
// This function can run for a maximum of 5 seconds
// ...
// export const runtime = "edge";
const handler: NextApiHandler = async (req, res) => {
  try {
    const body = req.body;

    if (body) {
      const { linkedinContent, option, aboutInstructions } = body;
      // let prompt;
      // await startDB();
      // const promptRec = await Prompt?.findOne({
      //   type: "linkedinTool",
      //   name: option,
      //   active: true,
      // });
      // prompt = promptRec ? promptRec.value : "";
      // if (option === "aboutInstructions") {
      //   prompt = prompt.replaceAll("{{instructions}}", aboutInstructions);
      // }
      // For LinkedIn Tool if file is uploaded then load content from that fiel

      let prompt = `Write a maximum of 100 characters copy for the “About Section” of my LinkedIn based on the data you have. Use the following instructions.

      - It should be detailed but compact, and engaging

      - Use relevant industry jargon as necessary. Make sure to provide a brief rundown of the main technical skills related to my job title.

      - Hook the audience right away and make the first sentence count by showing passion.

      - Provide a professional introduction explaining the present role and framing past job titles.

      - Highlight successes and the services I can offer to potential clients.

      - Include a call to action.

      Just give me the answer not add any extra labels

      pleas write this text the {"About Default Prompt"} in  last`;

      if (linkedinContent) {
        const model1 = new ChatOpenAI({
          streaming: true,
          modelName: "gpt-3.5-turbo",
          callbacks: [
            {
              handleLLMNewToken(token) {
                console.log(token);
                res.write(token);
              },
            },
          ],
          temperature: 0.5,
        });

        const input = `
            This is the User data:
            ${linkedinContent}

            This is the prompt:
            ${prompt}
            `;

        const chatPrompt = ChatPromptTemplate.fromPromptMessages([
          SystemMessagePromptTemplate.fromTemplate(`You are a helpful assistant that Reads the User data of a person and helps Writing About for the person LinkedIn.
            Following are the content of the resume (in JSON format):
            JSON user/resume data: {userData}

            `),
          HumanMessagePromptTemplate.fromTemplate("{prompt}"),
        ]);
        const promptSummary = input;

        const chainC = new LLMChain({
          prompt: chatPrompt,
          llm: model1,
        });
        await chainC.call({
          userData: JSON.stringify(linkedinContent),
          prompt: promptSummary,
        });

        res.end(); // Close  the stream
      }
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: "something went wrong",
    });
  }
};
export default handler;
