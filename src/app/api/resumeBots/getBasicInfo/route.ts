import { NextResponse } from "next/server";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import Prompt from "@/db/schemas/Prompt";
import OpenAI from "openai";

import { OpenAIStream, StreamingTextResponse } from "ai";

import TrainBot from "@/db/schemas/TrainBot";
import startDB from "@/lib/db";

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
export const maxDuration = 300; // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: any) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { result: "Not Authorised", success: false },
      { status: 401 }
    );
  }

  if (req) {
    const reqBody = await req.json();
    // const email = reqBody.email;
    const type = reqBody?.type; // request type
    const inputType = reqBody?.inputType; // input type
    const jobPosition = reqBody?.jobPosition;
    const userData = reqBody?.userData;
    // const email = reqBody?.email;
    const trainBotData = reqBody?.trainBotData;

    let content: any;

    if (userData || inputType === "userData") {
      // pass user data as it is
      content = userData;
    }

    if (type === "basicDetails") {
      try {
        const inputPrompt = `This is the Resume data (IN JSON): ${JSON.stringify(
          content
        )}
        
        Please find the following details in above provided userdata:
        shortName, jobTitle, linkedIn

        the shortName means two letters from Name of the person.
        the jobTitle means a one line slogan for this person.
        the linkedIn means the LinkedInUrl of the person.

        The output must be in this format. (following is an example)
        {
          "shortName": "AB",
          "jobTitle": "Software Engineer",
          "contact": {
            "linkedIn": "https://www.linkedin.com/in/abc/"
          }
        }


        The output must be a valid JSON
        Donot add anything if there is no value for a field. if there is no value leave that field blank donot add any extra labesls.

        `;
        const response: any = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          // stream: true,
          messages: [{ role: "user", content: inputPrompt }],
        });

        // make a trainBot entry
        try {
          if (trainBotData) {
            const obj = {
              type: "resume.getBasicInfo",
              input: inputPrompt,
              output: response?.choices[0]?.message?.content?.replace(
                /(\r\n|\n|\r)/gm,
                ""
              ),
              idealOutput: "",
              status: "pending",
              userEmail: trainBotData.userEmail,
              fileAddress: trainBotData.fileAddress,
              Instructions: `Get basic information for the resume`,
            };

            await TrainBot.create({ ...obj });
          }
        } catch (error) {}

        return NextResponse.json(
          {
            result: response?.choices[0]?.message?.content?.replace(
              /(\r\n|\n|\r)/gm,
              ""
            ),
            success: true,
          },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json(
          { result: error, success: false },
          { status: 404 }
        );
      }
    }

    if (type === "summary") {
      try {
        await startDB();
        const promptRec = await Prompt.findOne({
          type: "resume",
          name: "summary",
          active: true,
        });
        const prompt = promptRec.value;

        const promptSummary = prompt.replace("{{jobPosition}}", jobPosition);

        const inputPrompt = `This is the Resume data (IN JSON): ${JSON.stringify(
          content
        )}
        
        From the above resume data please:
                ${promptSummary}`;

        const response: any = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          stream: true,
          messages: [{ role: "user", content: inputPrompt }],
        });

        // make a trainBot entry

        try {
          if (trainBotData) {
            await startDB();
            const obj = {
              type: "resume.writeSummary",
              input: promptSummary,
              output: response?.choices[0]?.message?.content?.replace(
                /(\r\n|\n|\r)/gm,
                ""
              ),
              idealOutput: "",
              status: "pending",
              userEmail: trainBotData.userEmail,
              fileAddress: trainBotData.fileAddress,
              Instructions: `Write Summary for the resume`,
            };

            await TrainBot.create({ ...obj });
          }
        } catch (error) {}
        const stream = OpenAIStream(response);
        // Respond with the stream
        return new StreamingTextResponse(stream);
        // return NextResponse.json(
        //   { result: output, success: true },
        //   { status: 200 }
        // );
        // res.end();
      } catch (error) {
        return NextResponse.json(
          { result: error, success: false },
          { status: 404 }
        );
      }
    }

    if (type === "workExperience") {
      await startDB();

      const promptRec = await Prompt.findOne({
        type: "resume",
        name: "workExperienceGeneralDescription",
        active: true,
      });
      const workExperienceGeneralDescription = promptRec.value;

      const promptRec1 = await Prompt.findOne({
        type: "resume",
        name: "workExperienceAchievementDescription",
        active: true,
      });
      const workExperienceAchievementDescription = promptRec1.value;

      const parser = StructuredOutputParser.fromZodSchema(
        z.object({
          workExperience: z
            .array(
              z.object({
                fields: z.object({
                  title: z.string().describe("Designation"),
                  company: z.string().describe("company name"),
                  companyAddress: z
                    .string()
                    .describe("Country Name of the company"),
                  from: z.string().describe("From date"),
                  to: z.string().describe("To date"),
                  achievements: z
                    .array(z.string())
                    .describe(workExperienceAchievementDescription),
                }),
              })
            )
            // "list of three to five accomplishments, achievements results of how the person added value to this company"
            .describe(workExperienceGeneralDescription),
        })
      );

      const formatInstructions = parser.getFormatInstructions();

      try {
        const inputPrompt = `You are a helpful assistant that Reads the Resume data of a person and helps with creating a new Resume.
        Following are the content of the resume (in JSON format): 
        JSON user/resume data: ${JSON.stringify(content)}

        ${formatInstructions}`;
        // const resp = await chainB.call({
        //   userData: JSON.stringify(content),
        //   format_instructions: formatInstructions,
        //   prompt: "Answer should be a valid JSON",
        // });
        const response: any = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          stream: true,
          messages: [{ role: "user", content: inputPrompt }],
        });
        const stream = OpenAIStream(response);
        // Respond with the stream
        return new StreamingTextResponse(stream);
        // return NextResponse.json(
        //   { result: resp.text.replace(/(\r\n|\n|\r)/gm, ""), success: true },
        //   { status: 200 }
        // );
      } catch (error) {
        return NextResponse.json(
          { result: error, success: false },
          { status: 400 }
        );
      }
    }

    if (type === "primarySkills") {
      try {
        await startDB();

        const promptRec = await Prompt.findOne({
          type: "resume",
          name: "primarySkills",
          active: true,
        });
        const promptDB = promptRec.value;

        const promptRefined = await promptDB.replace(
          "{{jobPosition}}",
          jobPosition
        );

        const inputPrompt = `This is the Resume data (IN JSON): ${JSON.stringify(
          content
        )}
        
      
        This is the prompt:
        ${promptRefined}
        
        the answer must be in a valid JSON array
        `;

        const response: any = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          // stream: true,
          messages: [{ role: "user", content: inputPrompt }],
        });

        // make a trainBot entry
        try {
          if (trainBotData) {
            await startDB();

            const obj = {
              type: "resume.writePrimarySkills",
              input: inputPrompt,
              output: response?.choices[0]?.message?.content?.replace(
                /(\r\n|\n|\r)/gm,
                ""
              ),
              idealOutput: "",
              status: "pending",
              userEmail: trainBotData.userEmail,
              fileAddress: trainBotData.fileAddress,
              Instructions: `Write Primary Skills for Resume`,
            };

            await TrainBot.create({ ...obj });
          }
        } catch (error) {}

        return NextResponse.json(
          {
            result: response?.choices[0]?.message?.content?.replace(
              /(\r\n|\n|\r)/gm,
              ""
            ),
            success: true,
          },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json(
          { result: error, success: false },
          { status: 404 }
        );
      }
    }

    if (type === "professionalSkills") {
      try {
        await startDB();

        const promptRec = await Prompt.findOne({
          type: "resume",
          name: "professionalSkills",
          active: true,
        });
        const promptDB = promptRec.value;

        const promptRefined = await promptDB.replace(
          "{{jobPosition}}",
          jobPosition
        );

        const inputPrompt = `This is the Resume data (IN JSON): ${JSON.stringify(
          content
        )}
        
        This is the prompt:
        ${promptRefined}

        the answer must be in a valid JSON array
        `;

        const response: any = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          // stream: true,
          messages: [{ role: "user", content: inputPrompt }],
        });

        // make a trainBot entry
        try {
          if (trainBotData) {
            await startDB();

            const obj = {
              type: "resume.writeProfessionalSkills",
              input: inputPrompt,
              output: response?.choices[0]?.message?.content?.replace(
                /(\r\n|\n|\r)/gm,
                ""
              ),
              idealOutput: "",
              status: "pending",
              userEmail: trainBotData.userEmail,
              fileAddress: trainBotData.fileAddress,
              Instructions: `Write Professional Skills for Resume`,
            };

            await TrainBot.create({ ...obj });
          }
        } catch (error) {}

        return NextResponse.json(
          {
            result: response?.choices[0]?.message?.content?.replace(
              /(\r\n|\n|\r)/gm,
              ""
            ),
            success: true,
          },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json(
          { result: error, success: false },
          { status: 404 }
        );
      }
    }

    if (type === "secondarySkills") {
      try {
        await startDB();

        const promptRec = await Prompt.findOne({
          type: "resume",
          name: "secondarySkills",
          active: true,
        });
        const promptDB = promptRec.value;

        const promptRefined = await promptDB.replace(
          "{{jobPosition}}",
          jobPosition
        );
        const inputPrompt = `This is the Resume data (IN JSON): ${JSON.stringify(
          content
        )}
        
        This is the prompt:
        ${promptRefined}

        the answer must be in a valid JSON array
        `;

        const response: any = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          // stream: true,
          messages: [{ role: "user", content: inputPrompt }],
        });
        // make a trainBot entry
        try {
          if (trainBotData) {
            await startDB();

            const obj = {
              type: "resume.writeSecondarySkills",
              input: inputPrompt,
              output: response?.choices[0]?.message?.content?.replace(
                /(\r\n|\n|\r)/gm,
                ""
              ),
              idealOutput: "",
              status: "pending",
              userEmail: trainBotData.userEmail,
              fileAddress: trainBotData.fileAddress,
              Instructions: `Write Secondary Skills for Resume`,
            };

            await TrainBot.create({ ...obj });
          }
        } catch (error) {}

        return NextResponse.json(
          {
            result: response?.choices[0]?.message?.content?.replace(
              /(\r\n|\n|\r)/gm,
              ""
            ),
            success: true,
          },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json(
          { result: error, success: false },
          { status: 404 }
        );
      }
    }
  }
}
