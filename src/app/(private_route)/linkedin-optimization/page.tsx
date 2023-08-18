"use client";
import { useState } from "react";
import AboutGenerator from "@/components/dashboard/linkedin-optimization/About Generator";
import HeadlineGenerator from "@/components/dashboard/linkedin-optimization/HeadlineGenerator";
import JDGenerator from "@/components/dashboard/linkedin-optimization/JDGenerator";
import KeywordsGenerator from "@/components/dashboard/linkedin-optimization/KeywordsGenerator";
import DownloadDocx from "@/components/dashboard/linkedin-optimization/DownloadDocx";

const ResumeCreator = () => {
  const [keywords, setKeywords] = useState<string>("");
  const [headline, setHeadline] = useState<string>("");
  const [about, setAbout] = useState<string>("");
  const [jobDesc, setJobDesc] = useState<string>("");
  return (
    <>
      <div className="flex m-10 gap-4">
        <div className="w-full flex p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-2xl">LinkedIn Optimization</h2>
          <div className="float-right">
            <DownloadDocx
              keywords={keywords}
              headline={headline}
              about={about}
              jobDesc={jobDesc}
            />
          </div>
        </div>
      </div>
      <div className="flex m-10 gap-4">
        <div className="w-1/2 p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 dark:bg-gray-800 dark:border-gray-700">
          <KeywordsGenerator setKeywords={setKeywords} />
        </div>
        <div className="w-1/2 p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 dark:bg-gray-800 dark:border-gray-700">
          <HeadlineGenerator setHeadline={setHeadline} />
        </div>
      </div>

      <div className="flex m-10 gap-4">
        <div className="w-1/2 p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 dark:bg-gray-800 dark:border-gray-700">
          <AboutGenerator setAbout={setAbout} />
        </div>
        <div className="w-1/2 p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 dark:bg-gray-800 dark:border-gray-700">
          <JDGenerator setJobDesc={setJobDesc} />
        </div>
      </div>
    </>
  );
};
export default ResumeCreator;