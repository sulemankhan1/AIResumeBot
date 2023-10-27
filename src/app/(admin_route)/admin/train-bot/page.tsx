"use client";
import { getFormattedDate } from "@/helpers/getFormattedDateTime";
import {
  downloadIcon,
  leftArrowIcon,
  refreshIconRotating,
} from "@/helpers/iconsProvider";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

const activeCSS =
  "inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500";
const inactiveCSS =
  "inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300";

const TrainBotAdminPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  const fetchRecords = async () => {
    setLoading(true);
    if (!loading) {
      axios
        .get("/api/trainBot", {
          params: {
            status: activeTab,
          },
        })
        .then((res: any) => {
          if (res.data.success) {
            const result = res.data;
            setRecords(result.data);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleDownload = async () => {
    if (activeTab !== "reviewed") return;

    setDownloading(true);

    if (records) {
      const data = records.map((rec: any) => {
        return {
          messages: [
            { role: "user", content: rec.input },
            { role: "assistant", content: rec.idealOutput },
          ],
        };
      });

      const jsonl = data
        .map((obj) => JSON.stringify(obj, (key, value) => value, 0))
        .join("\n");

      const blob = new Blob([jsonl], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "trainBot.jsonl";
      link.click();
      setDownloading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      let result = await fetch("http://localhost:3001/api/trainBot/" + id, {
        method: "DELETE",
      });
      const res = await result.json();
      console.log(result);
      if (res.success) {
        return fetchRecords();
      } else {
        return alert("User Not Found");
      }
    } catch (error) {
      console.log("error ===> ", error);
    }
  };

  // when tab changes fetch records for that tab
  useEffect(() => {
    if (activeTab && activeTab !== "") {
      setRecords([]);
      fetchRecords();
    }
  }, [activeTab]);

  return (
    <div className="pt-30">
      <div className="my-5 ml-10">
        <Link
          href="/admin"
          className="flex flex-row gap-2 items-center hover:font-semibold transition-all"
        >
          {leftArrowIcon}
          Dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-2 items-center justify-center">
        <div className=" p-8 flex flex-col gap-2 border w-11/12">
          <h2 className="text-xl ">Train AI Bots</h2>

          {/* Tabs */}

          <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 m-0">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab("pending")}
                className={activeTab === "pending" ? activeCSS : inactiveCSS}
              >
                Pending Review
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab("reviewed")}
                className={activeTab === "reviewed" ? activeCSS : inactiveCSS}
              >
                Reviewed
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab("trained")}
                className={activeTab === "trained" ? activeCSS : inactiveCSS}
              >
                Trained
              </button>
            </li>
          </ul>

          {activeTab === "reviewed" && (
            <div className="flex justify-end">
              <button
                onClick={handleDownload}
                className=" flex gap-2 items-center rounded-full border-2 border-primary px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-primary transition duration-150 ease-in-out hover:border-primary-600 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-primary-600 focus:border-primary-600 focus:text-primary-600 focus:outline-none focus:ring-0 active:border-primary-700 active:text-primary-700 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10"
              >
                {downloading ? (
                  <>{refreshIconRotating} Downloading...</>
                ) : (
                  <>{downloadIcon} Download All</>
                )}
              </button>
            </div>
          )}

          {/* Table */}
          <div className="">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 ">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      S.No
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Date Time
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        className="text-center p-6 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                        colSpan={10}
                      >
                        Loading ...
                      </td>
                    </tr>
                  )}
                  {!loading && records && records.length === 0 && (
                    <tr>
                      <td
                        className="text-center p-6 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                        colSpan={10}
                      >
                        No records found
                      </td>
                    </tr>
                  )}
                  {records &&
                    records.map((rec: any, index: number) => (
                      <tr
                        key={rec._id}
                        className="bg-gray-100 border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="px-6 py-4">{index + 1}</td>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {rec.type.replaceAll(".", " -> ")}
                        </th>
                        <td className="px-6 py-4">
                          {rec.status === "pending" && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                          {rec.status === "reviewed" && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Reviewed
                            </span>
                          )}
                          {rec.status === "trained" && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Trained
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getFormattedDate(rec.createdAt)}
                        </td>
                        <td className="px-6 py-4 ">
                          <Link
                            href={`/admin/train-bot/${rec._id}`}
                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                          >
                            Review
                          </Link>

                          <button
                            className="font-medium ml-8 text-blue-600 dark:text-blue-500 hover:underline"
                            onClick={() => handleDelete(rec._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainBotAdminPage;