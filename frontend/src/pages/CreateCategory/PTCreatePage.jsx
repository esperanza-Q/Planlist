// pages/CreateCategory/PTCreatePage.jsx
import Step1StartProject from "../../components/CreatePT/CreatePT";
import Step2AddParticipants from "../../components/CreatePT/AddParticipants";
import Step3CreateDetailProject from "../../components/CreatePT/CreateDetailPT"; // this step should call updateFormData({ plannerId, ... })
import Step4SelectDate from "../../components/CreatePT/SelectDate";
import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

// (optional) used elsewhere in flow
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
    title: "",
    startDate: null,
    endDate: null,
    isTrainer: false,
    project: null,                 // (full server payload if you store it)
    projectId: initialProjectId ?? null,
    plannerId: null,               // 🔑 gets set at Step 3 (addSession response)
    session: null,                 // optional: keep addSession response
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    // console.log("[PTCreatePage] updateFormData:", newData);
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
          updateFormData={updateFormData} // <- this step should set { plannerId } from /addSession
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}

      {step === 4 && (
        <Step4SelectDate
          formData={formData}          // <- SelectDate reads formData.plannerId
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
    </div>
  );
};

export default PTCreatePage;
