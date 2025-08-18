// pages/CreateCategory/MeetingCreatePage.jsx
import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Step1BigMeetingStartProject from "../../components/MeetingCreatePage/BigMeetingStartProject";
import Step2AddParticipants from "../../components/MeetingCreatePage/Add_Participants_meeting";
import Step3DetailMeetingStartPage from "../../components/MeetingCreatePage/DetailMeetingStartPage";
import Step4SelectDate from "../../components/MeetingCreatePage/SelectDate_meeting";

// helper
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const MeetingCreatePage = () => {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // read step & projectId from query
  const initialStep = useMemo(() => {
    const s = Number(params.get("step"));
    return clamp(Number.isFinite(s) ? s : 1, 1, 5);
  }, [params]);

  const initialProjectId = params.get("projectId");
  const initialPlannerId = params.get("plannerId");

  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState({
    title: '',
    startDate: null,
    endDate: null,
    projectId: initialProjectId ?? null, // keep projectId around
     plannerId: initialPlannerId ?? null,
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <div>
      {step === 1 && (
        <Step1BigMeetingStartProject
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
        <Step3DetailMeetingStartPage
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

export default MeetingCreatePage;
