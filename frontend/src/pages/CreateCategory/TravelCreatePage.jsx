// pages/CreateCategory/TravelCreatePage.jsx
import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

import Step1StartProject from "../../components/CreateTravel/CreateTravel";
import Step2AddParticipants from "../../components/CreateTravel/AddParticipant";
import Step3SelectDate from "../../components/CreateTravel/TravelSelectDate";
import Step4SelectPlace from "../../components/CreateTravel/TravelSelectPlace";
import Step5CreatePlanner from "../../components/CreateTravel/TravelCreatePlanner";
import Step6FinalMap from "../../components/CreateTravel/FinalMap";

import "../../components/CreateTravel/TravelCreatePage.css";

// optional helper
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// test data (unchanged)
const recommendedDates = [
  { start: new Date(2025, 7, 12), end: new Date(2025, 7, 13) },
  { start: new Date(2025, 7, 24), end: new Date(2025, 7, 30) },
  { start: new Date(2025, 7, 1), end: new Date(2025, 7, 1) },
];

const TravelCreatePage = () => {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // read step & projectId from query like PTCreatePage does
  const initialStep = useMemo(() => {
    const s = Number(params.get("step"));
    return clamp(Number.isFinite(s) ? s : 1, 1, 6);
  }, [params]);

  const initialProjectId = params.get("projectId");

  const [step, setStep] = useState(initialStep);

  const [formData, setFormData] = useState({
    title: "",
    startDate: null,
    endDate: null,
    project: null,                 // full server payload (optional)
    projectId: initialProjectId ?? null,
    // you can add other fields you need to persist across steps
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    // console.log("[TravelCreatePage] updateFormData:", newData);
  };

  return (
    <div>
      {step === 1 && (
        <Step1StartProject
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
        />
      )}

      {step === 2 && (
        <Step2AddParticipants
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}

      {step === 3 && (
        <Step3SelectDate
          formData={formData}
          updateFormData={updateFormData}
          recommendedDates={recommendedDates}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}

      {step === 4 && (
        <Step4SelectPlace
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}

      {step === 5 && (
        <Step5CreatePlanner
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}

      {step === 6 && (
        <Step6FinalMap
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
    </div>
  );
};

export default TravelCreatePage;
