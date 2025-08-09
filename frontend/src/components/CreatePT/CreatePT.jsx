import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './StartProject.css';

import PT_icon from '../../assets/dumbbell_icon.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";



const CreatePT = ({ formData, updateFormData, nextStep }) => {
  const [title, setTitle] = useState(formData.title || '');
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [endDate, setEndDate] = useState(formData.endDate || new Date());

  const handleNext = () => {
    // formData에 값 저장 후 다음 스텝으로 이동
    updateFormData({ title, startDate, endDate });
    nextStep();
  };

  return (
    <div className="form-container">
      <div className="form-box" style={{height:"459px"}}>
        <div className="form-icon"> <img src={PT_icon}/></div>

        <h2>Start PT Project</h2>
        <p className="form-description">
          Welcome Project! Please enter your details.
        </p>

        <div className="underSection">
            <label>Project Title</label>
            <input
            type="text"
            className='title-box'
            placeholder="Enter your title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            />
       
        </div>
      </div>
      {/* ✅ 다음 버튼 */}
        <button className="project-next-button" onClick={handleNext}><ProjectNextIcon/></button>
    </div>
  );
};

export default CreatePT;
