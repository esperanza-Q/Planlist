import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import Step1StartProject from "../../components/StandardCreatePage/StartProject";
import Step2AddParticipants from "../../components/StandardCreatePage/AddParticipants";
import Step3Subtitlte from "../../components/StandardCreatePage/DetailStandardStartPage";
import Step4SelectDate from "../../components/StandardCreatePage/SelectDate";
import Step5ChoosePlace from "../../components/StandardCreatePage/StandaraSelectPlace";
import Step6SaveProject from "../../components/StandardCreatePage/SaveProject";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const StandardCreatePage = () => {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // Read initial step from URL (?step=3) and clamp to [1..6]
  const initialStep = useMemo(() => {
    const s = Number(params.get("step"));
    return clamp(Number.isFinite(s) ? s : 1, 1, 6);
  }, [params]);

  // Seed projectId from URL (?projectId=123)
  const initialProjectId = params.get("projectId");

  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState({
    title: "",
    startDate: null,
    endDate: null,
    project: null,                         // optional full server payload
    projectId: initialProjectId ?? null,   // <- seed from URL
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateFormData = (patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
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
        <Step3Subtitlte
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

      {step === 5 && (
        <Step5ChoosePlace
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}

      {step === 6 && (
        <Step6SaveProject
          formData={formData}
          updateFormData={updateFormData}
          prevStep={prevStep}
        />
      )}
    </div>
  );
};

export default StandardCreatePage;
