import Step1StartProject from "../../components/CreatePT/CreatePT"
import Step2AddParticipants from "../../components/CreatePT/AddParticipants"
import Step3CreateDetailProject from "../../components/CreatePT/CreateDetailPT"
import Step4SelectDate from "../../components/CreatePT/SelectDate"
import { useState } from "react";


//테스트용 표시될 날짜
const recommendedDates = [
  { start: new Date(2025, 7, 12), end: new Date(2025, 7, 13) }, 
  { start: new Date(2025, 7, 24), end: new Date(2025, 7, 30) }, 
  { start: new Date (2025, 7, 1), end: new Date(2025, 7, 1)}
];


const PTCreatePage = () => {
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
            <div>
            <Step2AddParticipants 
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            />
            
            </div>
        )}
        {step === 3 && (
            <div>
            <Step3CreateDetailProject 
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            />
            
            </div>
        )}
        {step === 4 && (
            <div>
            <Step4SelectDate 
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            />
            
            </div>
        )}
        </div>
          


    );
}

export default PTCreatePage