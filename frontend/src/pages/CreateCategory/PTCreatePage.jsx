// pages/CreateCategory/PTCreatePage.jsx
import Step1StartProject from "../../components/CreatePT/CreatePT";
import Step2AddParticipants from "../../components/CreatePT/AddParticipants";
import Step3CreateDetailProject from "../../components/CreatePT/CreateDetailPT";
import Step4SelectDate from "../../components/CreatePT/SelectDate";
import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

// 테스트용 표시될 날짜
const recommendedDates = [
  { start: new Date(2025, 7, 12), end: new Date(2025, 7, 13) }, 
  { start: new Date(2025, 7, 24), end: new Date(2025, 7, 30) }, 
  { start: new Date (2025, 7, 1), end: new Date(2025, 7, 1)}
];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const PTCreatePage = () => {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const initialStep = useMemo(() => {
    const s = Number(params.get("step"));
    return clamp(Number.isFinite(s) ? s : 1, 1, 4);
  }, [params]);

  const initialProjectId = params.get("projectId");

  const [step, setStep] = useState(initialStep);

  const [formData, setFormData] = useState({
    title: '',
    startDate: null,
    endDate: null,
    isTrainer: false,
    project: null,
    projectId: initialProjectId ?? null,
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    console.log(newData);
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
        <Step3CreateDetailProject
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}

      {step === 4 && (
        <Step4SelectDate
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
    </div>
  );
};

export default PTCreatePage;
