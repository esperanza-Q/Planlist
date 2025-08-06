

import React, { useState } from 'react';
import Step1BigMeetingStartProject from "../../components/MeetingCreatePage/BigMeetingStartProject";
import Step2AddParticipants from "../../components/StandardCreatePage/AddParticipants";

import Step3DetailMeetingStartPage from "../../components/MeetingCreatePage/DetailMeetingStartPage";
import Step4SelectDate from "../../components/StandardCreatePage/SelectDate";
import Step5MeetingSaveProject from "../../components/MeetingCreatePage/MeetingSaveProject";


const MeetingCreatePage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    startDate: null,
    endDate: null,
    // 다른 스텝에서 입력될 데이터들도 미리 여기에 포함
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
        {step === 5 && (
        <Step5MeetingSaveProject
            formData={formData}
            updateFormData={updateFormData}
            prevStep={prevStep}
        />
        )}
      
    </div>
  );
};

export default MeetingCreatePage;
