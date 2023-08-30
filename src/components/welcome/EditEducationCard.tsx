import { useDispatch, useSelector } from "react-redux";
import { Education, setStepFour } from "@/store/registerSlice";
import { useFormik } from "formik";
import * as Yup from "yup";

import { useEffect } from "react";
import EducationForm from "./EducationForm";

const EditEducationCard = () => {
  const dispatch = useDispatch();
  const stepFour = useSelector((state: any) => state.register.stepFour);
  const { list, state, editId } = stepFour;

  const formik = useFormik({
    initialValues: {
      id: "",
      educationLevel: "",
      fieldOfStudy: "",
      schoolName: "",
      schoolLocation: "",
      fromMonth: "",
      fromYear: new Date().getFullYear(),
      isContinue: false,
      toMonth: "",
      toYear: new Date().getFullYear(),
    },
    validationSchema: Yup.object({
      educationLevel: Yup.string().required("Education Level is Required"),
    }),
    onSubmit: async (values) => {
      const listWithoutCurrent = list.filter(
        (rec: Education) => rec.id !== editId
      );
      dispatch(setStepFour({ list: [values, ...listWithoutCurrent] }));
      dispatch(setStepFour({ state: "show" }));
    },
  });

  useEffect(() => {
    const foundRec = list.find((rec: Education) => rec.id === editId);

    formik.setValues({
      id: foundRec.id,
      educationLevel: foundRec.educationLevel,
      fieldOfStudy: foundRec.fieldOfStudy,
      schoolName: foundRec.schoolName,
      schoolLocation: foundRec.schoolLocation,
      fromMonth: foundRec.fromMonth,
      fromYear: foundRec.fromYear,
      isContinue: foundRec.isContinue,
      toMonth: foundRec.toMonth,
      toYear: foundRec.toYear,
    });
  }, [list]);

  return (
    <div className="w-full max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">
        Update Education
        <button
          type="button"
          onClick={(e) => dispatch(setStepFour({ state: "show" }))}
          className="text-xs float-right flex flex-row gap-1 items-center hover:bg-gray-50 mt-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          View all educations
        </button>
      </h2>
      <EducationForm formik={formik} />
    </div>
  );
};
export default EditEducationCard;
