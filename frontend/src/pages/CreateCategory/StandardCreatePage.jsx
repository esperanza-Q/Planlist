import React, { useState } from 'react';
import Step1StartProject from "../../components/StandardCreatePage/StartProject";
import Step2AddParticipants from "../../components/StandardCreatePage/AddParticipants";
import Step3SelectDate from "../../components/StandardCreatePage/SelectDate";
import Step4ChoosePlace from "../../components/StandardCreatePage/ChoosePlace";
import Step5SaveProject from "../../components/StandardCreatePage/SaveProject";


const StandardCreatePage = () => {
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
            nextStep={nextStep}
            prevStep={prevStep}
        />
        )}
        {step === 4 && (
        <Step4ChoosePlace
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
        />
        )}
        {step === 5 && (
        <Step5SaveProject
            formData={formData}
            updateFormData={updateFormData}
            prevStep={prevStep}
        />
        )}
      
    </div>
  );
};

export default StandardCreatePage;
