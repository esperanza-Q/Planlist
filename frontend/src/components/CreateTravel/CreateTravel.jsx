import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../StandardCreatePage/StartProject.css';

import travel_icon from '../../assets/travel_icon.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

import { api } from "../../api/client";


const CreateTravel = ({ formData, updateFormData, nextStep }) => {
  const [TravelTitle, setTitle] = useState(formData.title || '');
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [endDate, setEndDate] = useState(formData.endDate || new Date());

  const handleNext = async(e) => {
    // formData에 값 저장 후 다음 스텝으로 이동
    if(!TravelTitle){
      alert("Please enter a title for your travel project.");
      return;
    }
    try{
      await api.postSession("api/travel/CreateProject", {
        title: TravelTitle,
      });
      updateFormData({ TravelTitle, startDate, endDate });
      nextStep();

    }
    catch(e){
      console.error("Failed to send travel creation request:", e);
      alert("Failed to create travel project. Please try again.");
      return;
    }

  };

  return (
    <div className="form-container">
      <div className="form-box" style={{height:"459px"}}>
        <div className="form-icon"> <img src={travel_icon}/></div>

        <h2>Start Travel Project</h2>
        <p className="form-description">
          Welcome Project! Please enter your details.
        </p>

        <div className="underSection">
            <label>Project Title</label>
            <input
            type="text"
            className='title-box'
            placeholder="Enter your title"
            value={TravelTitle}
            onChange={(e) => setTitle(e.target.value)}
            />
       
        </div>
      </div>
      {/* ✅ 다음 버튼 */}
        <button className="project-next-button" onClick={handleNext}><ProjectNextIcon/></button>
    </div>
  );
};

export default CreateTravel;
