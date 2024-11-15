"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import ResumeTemplate1 from "@/components/dashboard/resume-templates/template-1";
import { useDispatch, useSelector } from "react-redux";
import {
  WorkExperience,
  setField,
  setIsLoading,
  setUserData,
} from "@/store/userDataSlice";
import {
  setBasicInfo,
  setSummary,
  setWorkExperience,
  setPrimarySkills,
  setSecondarySkills,
  setProfessionalSkills,
  setId,
  setState,
  setWorkExperienceArray,
  resetResume,
  // setLoadingState,
} from "@/store/resumeSlice";
// import { exitFullScreenIcon, fullScreenIcon } from "@/helpers/iconsProvider";
import axios from "axios";
import { makeid } from "@/helpers/makeid";
import RecentResumeCard from "@/components/dashboard/resume-builder/RecenResumesCard";
import GenerateNewResumeCard from "@/components/dashboard/resume-builder/GenerateNewResumeCard";
import { checkIconSmall, leftArrowIcon } from "@/helpers/iconsProvider";
import Confetti from "react-dom-confetti";
import Link from "next/link";
import LimitCard from "@/components/dashboard/LimitCard";
import useTheme from "@/lib/useTheme";

const ResumeBuilder = () => {
  const [theme] = useTheme();
  const [confettingRunning, setConfettiRunning] = useState(false);
  const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 200,
    decay: 0.95,
    duration: 8000,
    width: "25px",
    height: "25px",
  };

  const runConfetti = () => {
    setConfettiRunning(true);
    setTimeout(() => {
      setConfettiRunning(false);
    }, 3000); // Adjust the duration as needed
  };

  const componentRef = useRef<any>(null);
  const { data: session } = useSession();

  // Local States
  const [streamedSummaryData, setStreamedSummaryData] = useState("");
  const [streamedJDData, setStreamedJDData] = useState("");
  const [aiInputUserData, setAiInputUserData] = useState<any>();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [availablePercentage, setAvailablePercentage] = useState<number>(0);
  const [percentageCalculated, setPercentageCalculated] =
    useState<boolean>(false);

  // Redux
  const dispatch = useDispatch();
  const resumeData = useSelector((state: any) => state.resume);
  const userData = useSelector((state: any) => state.userData);

  const handleGenerate = useCallback(async () => {
    await getUserDataIfNotExists();
    // reset resume
    dispatch(resetResume(resumeData.state));

    if (
      resumeData.state.jobPosition !== "" &&
      session?.user?.email &&
      percentageCalculated
    ) {
      dispatch(setState({ name: "resumeLoading", value: true }));
      dispatch(setId(""));
      getBasicInfo();
      getSummary();
      getPrimarySkills();
      getProfessionalSkills();
      getSecondarySkills();
      await getWorkExperienceNew();
      runConfetti();
    }
  }, [resumeData.state, percentageCalculated]);

  // const makeAPICallWithRetry: any = async (
  //   apiFunction: any,
  //   retriesLeft = 2
  // ) => {
  //   try {
  //     // Attempt the API call
  //     return await apiFunction();
  //   } catch (error) {
  //     // If an error occurs and retries are left, retry the call
  //     if (retriesLeft > 0) {
  //       console.log(
  //         `API call failed. Retrying... Retries left: ${retriesLeft}`
  //       );
  //       return makeAPICallWithRetry(apiFunction, retriesLeft - 1);
  //     } else {
  //       // If no retries are left, handle the error accordingly
  //       console.error("API call failed after multiple retries.", error);
  //       throw new Error("API call failed after multiple retries");
  //     }
  //   }
  // };
  const getBasicInfo = async () => {
    // dispatch(setLoadingState("basicInfo"));
    // return makeAPICallWithRetry(async () => {
    return fetch("/api/resumeBots/getBasicInfo", {
      method: "POST",
      body: JSON.stringify({
        type: "basicDetails",
        inputType: "userData",
        userData: aiInputUserData,
        jobPosition: resumeData.state.jobPosition,
        trainBotData: {
          userEmail: userData.email,
          fileAddress: userData.files[0].fileName,
        },
      }),
    }).then(async (resp: any) => {
      const res = await resp.json();

      if (res.success && res?.result) {
        let myJSON;
        if (typeof res.result === "object") {
          myJSON = res.result;
        } else {
          myJSON = await JSON.parse(res.result);
        }
        const basicObj = {
          ...myJSON,
          name: userData?.firstName + " " + userData?.lastName,
          contact: {
            ...myJSON?.contact,
            email: userData?.email,
            phone: userData?.phone,
          },
          education: userData?.education,
        };
        dispatch(setBasicInfo(basicObj));
      }
    });
    // });
  };

  const getSummary = async () => {
    // return makeAPICallWithRetry(async () => {
    await getUserDataIfNotExists();
    setStreamedSummaryData("");
    dispatch(setSummary(""));
    // dispatch(setLoadingState("summary"));
    return fetch("/api/resumeBots/getBasicInfo", {
      method: "POST",
      body: JSON.stringify({
        type: "summary",
        jobPosition: resumeData.state.jobPosition,
        trainBotData: {
          userEmail: userData.email,
          fileAddress: userData.files[0].fileName,
        },
      }),
    }).then(async (resp: any) => {
      // const res = await resp.json();

      if (resp.ok) {
        const reader = resp.body.getReader();
        let summaryTemp = "";
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const text = new TextDecoder().decode(value);
          setStreamedSummaryData((prev) => prev + text);
          summaryTemp += text;
        }

        dispatch(setSummary(summaryTemp));
      } else {
        setStreamedSummaryData("Error! Something went wrong");
      }
    });
    // });
  };

  const getWorkExperienceNew = async () => {
    // return makeAPICallWithRetry(async () => {
    // dispatch(setLoadingState("workExperience"));
    await getUserDataIfNotExists();

    if (userData.isFetched) {
      // remove ids from experiences
      const experiences = userData.experience.map((item: WorkExperience) => {
        const { id, ...rest } = item;
        return rest;
      });
      setStreamedJDData("");
      dispatch(setWorkExperience(""));
      let temp = "";
      const workExpArr: any = [];
      for (const [index, experience] of experiences.entries()) {
        let workExpArrObj: any = {};
        let html = "";
        html += `<h2 style="font-size: 1.3rem; font-weight: bold; line-height: 2rem; ">${experience?.jobTitle}</h2>`;
        workExpArrObj.title = experience?.jobTitle;

        html += `<h2 style="font-size: 1.1rem; line-height: 1.5rem">
        
        ${experience?.fromMonth} ${experience?.fromYear} - ${
          experience?.isContinue
            ? "Present"
            : experience?.toMonth + " " + experience?.toYear
        } | ${experience?.company} | 
        ${experience?.cityState} ${experience?.country}
                  </h2>`;
        html += `<div>`;
        workExpArrObj.cityState = experience?.cityState;
        workExpArrObj.country = experience?.country;
        workExpArrObj.company = experience?.company;
        workExpArrObj.fromMonth = experience?.fromMonth;
        workExpArrObj.fromYear = experience?.fromYear;
        workExpArrObj.isContinue = experience?.isContinue;
        workExpArrObj.toMonth = experience?.toMonth;
        workExpArrObj.toYear = experience?.toYear;

        temp += html;
        let achievementTemp = "";
        setStreamedJDData((prev) => prev + html);

        const res: any = await fetch("/api/resumeBots/jdGeneratorSingle", {
          method: "POST",
          body: JSON.stringify({
            experience: experience,
            trainBotData: {
              userEmail: userData.email,
              fileAddress: userData.files[0].fileName,
            },
          }),
        });
        // const response = await res.json();
        // console.log("result", result, typeof result);
        if (res.ok) {
          const reader = res.body.getReader();
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            const text = new TextDecoder().decode(value);
            // const text = response.result;
            setStreamedJDData((prev) => prev + text);
            temp += text;
            achievementTemp += text;
          }
        }

        setStreamedJDData((prev) => prev + `</div> <br /> `);
        temp += `</div> <br /> `;
        const achivementsArray = fetchLIstOfStrings(achievementTemp);
        workExpArrObj.achievements = achivementsArray;
        workExpArr.push(workExpArrObj);
      }
      dispatch(setWorkExperienceArray({ workExperienceArray: workExpArr }));
      dispatch(setWorkExperience(temp));
      dispatch(setState({ name: "resumeLoading", value: false }));
    }
    // });
  };

  const fetchLIstOfStrings = (text: string) => {
    // Create a new DOMParser
    const parser = new DOMParser();

    // Parse the HTML string into a DOM document
    const doc = parser.parseFromString(text, "text/html");

    // Get the <ul> element
    const ulElement = doc.querySelector("ul");
    if (ulElement) {
      // Get an array of <li> elements
      const liElements = ulElement.querySelectorAll("li");

      // Initialize an array to store the values of <li> elements
      const valuesArray: any = [];

      // Loop through the <li> elements and extract their text content
      liElements.forEach((liElement: any) => {
        valuesArray.push(liElement.textContent.trim());
      });
      return valuesArray;
    }

    return [];
  };

  // const getWorkExperience = async () => {
  //   await getUserDataIfNotExists();
  //   // dispatch(setLoadingState("workExperience"));
  //   return fetch("/api/resumeBots/getBasicInfo", {
  //     method: "POST",
  //     body: JSON.stringify({
  //       type: "workExperience",
  //       jobPosition: resumeData.state.jobPosition,
  //     }),
  //   }).then(async (resp: any) => {
  //     const res = await resp.json();
  //     if (res.success) {
  //       console.clear();
  //       if (res?.data?.text) {
  //         const tSon = JSON.stringify(res?.data?.text);
  //         const myJSON = JSON.parse(tSon);
  //         console.log("myJSON1: ", myJSON);
  //         dispatch(setWorkExperience(myJSON));
  //       } else if (res?.data) {
  //         const myJSON = JSON.parse(res.data);
  //         console.log("myJSON2: ", myJSON);
  //         dispatch(setWorkExperience(myJSON));
  //       }
  //     }
  //   });
  // };

  const getPrimarySkills = async () => {
    // return makeAPICallWithRetry(async () => {
    // dispatch(setLoadingState("primarySkills"));
    await getUserDataIfNotExists();
    return fetch("/api/resumeBots/getBasicInfo", {
      method: "POST",
      body: JSON.stringify({
        type: "primarySkills",
        userData: aiInputUserData,
        jobPosition: resumeData.state.jobPosition,
        trainBotData: {
          userEmail: userData.email,
          fileAddress: userData.files[0].fileName,
        },
      }),
    }).then(async (resp: any) => {
      const res = await resp.json();
      if (res.success) {
        if (res?.result) {
          let myJSON = JSON.parse(JSON.stringify(res.result));

          myJSON = JSON.parse(myJSON);
          dispatch(setPrimarySkills({ primarySkills: myJSON }));
        }
      }
    });
    // });
  };

  const getProfessionalSkills = async () => {
    // return makeAPICallWithRetry(async () => {
    // dispatch(setLoadingState("professionalSkills"));
    return fetch("/api/resumeBots/getBasicInfo", {
      method: "POST",
      body: JSON.stringify({
        type: "professionalSkills",
        email: session?.user?.email,
        userData: aiInputUserData,
        jobPosition: resumeData.state.jobPosition,
        trainBotData: {
          userEmail: userData.email,
          fileAddress: userData.files[0].fileName,
        },
      }),
    }).then(async (resp: any) => {
      const res = await resp.json();
      if (res.success) {
        if (res?.result) {
          let myJSON = JSON.parse(JSON.stringify(res.result));

          myJSON = JSON.parse(myJSON);
          dispatch(setProfessionalSkills({ professionalSkills: myJSON }));
        }
      }
    });
    // });
  };

  const getSecondarySkills = async () => {
    // return makeAPICallWithRetry(async () => {
    // dispatch(setLoadingState("secondarySkills"));
    return fetch("/api/resumeBots/getBasicInfo", {
      method: "POST",
      body: JSON.stringify({
        type: "secondarySkills",
        email: session?.user?.email,
        userData: aiInputUserData,
        jobPosition: resumeData.state.jobPosition,
        trainBotData: {
          userEmail: userData.email,
          fileAddress: userData.files[0].fileName,
        },
      }),
    }).then(async (resp: any) => {
      const res = await resp.json();
      if (res.success) {
        if (res?.result) {
          let myJSON = JSON.parse(JSON.stringify(res.result));

          myJSON = JSON.parse(myJSON);
          dispatch(setSecondarySkills({ secondarySkills: myJSON }));
        }
      }
    });
    // });
  };

  const getUserDataIfNotExists = async () => {
    // return makeAPICallWithRetry(async () => {
    if (!userData.isLoading && !userData.isFetched) {
      dispatch(setIsLoading(true));
      // Fetch userdata if not exists in Redux
      const res = await fetch(
        `/api/users/getOneByEmail?email=${session?.user?.email}`
      );

      const response = await res.json();

      dispatch(setUserData(response.result));
      dispatch(setIsLoading(false));
      dispatch(setField({ name: "isFetched", value: true }));
    }
    // });
  };

  const saveResumeToDB = async (data: any = "") => {
    // return makeAPICallWithRetry(async () => {
    const source = data === "" ? resumeData : data;
    let obj = source;
    if (!source.id || source.id === "") {
      obj = { ...source, id: makeid(), dateTime: new Date() };
    }

    axios
      .post("/api/resumeBots/saveResumeToDB", {
        email: session?.user?.email,
        resumeData: obj,
      })
      .then(async (resp) => {
        dispatch(setId(obj.id));
        // update user in redux
        const res = await fetch(
          `/api/users/getOneByEmail?email=${session?.user?.email}`
        );

        const response = await res.json();
        const user = response.result;
        dispatch(setUserData(user));
        // get user package details
        const res2 = await fetch(
          `/api/users/getUserPackageDetails?id=${user?.userPackage}`
        );
        const data = await res2.json();
        if (data.success) {
          const userPackage = data.result;
          // set user package details to redux
          dispatch(setField({ name: "userPackageData", value: userPackage }));
        }

        // show alert for 2 seconds using setTimeout
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 1000);
      });
    // });
  };

  useEffect(() => {
    if (!resumeData.state.resumeLoading && resumeData?.name) {
      saveResumeToDB();
    }
  }, [resumeData?.state?.resumeLoading]);

  useEffect(() => {
    if (userData && userData?.email) {
      setAiInputUserData({
        contact: userData?.contact,
        education: userData?.education,
        email: userData?.email,
        experience: userData?.experience,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        phone: userData?.phone,
        skills: userData?.skills,
      });
    }
  }, [userData]);

  return (
    <>
      <div className="w-[95%] my-5 ml-10 flex items-center justify-between ">
        <Link
          href="/dashboard"
          className="flex flex-row gap-2 items-center hover:font-semibold transition-all"
        >
          {leftArrowIcon}
          Dashboard
        </Link>

        <LimitCard
          title="AvailableCredits"
          limit={userData?.userPackageData?.limit?.resumes_generation}
          used={userData?.userPackageUsed?.resumes_generation}
          setPercentageCalculated={setPercentageCalculated}
          availablePercentage={availablePercentage}
          setAvailablePercentage={setAvailablePercentage}
        />
      </div>
      {showAlert && (
        <div
          className="fixed bottom-10 right-10 flex flex-row gap-2 justify-center items-center bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-opacity cursor-pointer"
          onClick={() => setShowAlert(false)}
        >
          {checkIconSmall}
          Auto saved
        </div>
      )}
      <div className="m-10 mt-2 w-[95%]  p-4  border border-gray-200 rounded-lg shadow sm:p-6 ">
        <RecentResumeCard componentRef={componentRef} />
      </div>

      <GenerateNewResumeCard
        handleGenerate={handleGenerate}
        availablePercentage={availablePercentage}
      />

      <div className="flex justify-center items-center">
        <Confetti active={confettingRunning} config={confettiConfig} />
      </div>

      {resumeData &&
        (resumeData?.name ||
          resumeData?.contact?.email ||
          resumeData?.summary) && (
          <div className="m-10  w-[95%] bg-white border border-gray-200 rounded-lg shadow sm:p-6 ">
            <div
              className={`w-full  ${
                resumeData.state.resumeLoading ? "animate-pulse" : ""
              }`}
              ref={componentRef}
            >
              <ResumeTemplate1
                streamedSummaryData={streamedSummaryData}
                streamedJDData={streamedJDData}
                saveResumeToDB={saveResumeToDB}
              />
            </div>
          </div>
        )}
      <div className="block mb-40"></div>
    </>
  );
};
export default ResumeBuilder;
