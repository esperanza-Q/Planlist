import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DetailPTStartPage.css';

import { api } from '../../api/client';
import PT_icon from '../../assets/dumbbell_icon.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";



const DetailPTStartPage = ({ formData, updateFormData, nextStep }) => {
  const [title, setTitle] = useState(formData.title || '');
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [endDate, setEndDate] = useState(formData.endDate || new Date());

  const handleNext = async() => {

    if (!title.trim()) {
      alert("Please enter a title for your PT project.");
      return;
    }

    try {
      const project = await api.postSession("/api/pt/project/addSession", {
        title,
        startDate,
        endDate
      });



    // formData에 값 저장 후 다음 스텝으로 이동
    updateFormData({ title, startDate, endDate });
    nextStep();

    } catch (e) {
      console.error("Failed to send PT creation request:", e);
      alert("Failed to create PT project. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <div className="form-icon"> <img src={PT_icon} /> </div>

        <h2>Start PT session</h2>
        <p className="form-description">
          Enter a specific topic under the main project.
        </p>

        <div className="underSection">
            <label>Sub Project Title</label>
            <input
            type="text"
            className='title-box'
            placeholder="Enter your title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            />
       
        <label>Select the week</label>
            <div className="date-picker-wrapper">
            <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
            />
            <span> ~ </span>
            <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
            />
            </div>
        </div>
      </div>
      {/* ✅ 다음 버튼 */}
        <button className="project-next-button" onClick={handleNext}><ProjectNextIcon/></button>
    </div>
  );
};

export default DetailPTStartPage;
