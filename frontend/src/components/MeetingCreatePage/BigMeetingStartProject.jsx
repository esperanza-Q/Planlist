import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import './BigMeetingStartProject.css';

import DiscussionIcon from '../../icons/DiscussionIcon';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";



const BigMeetingStartProject = ({ formData, updateFormData, nextStep }) => {
  const [title, setTitle] = useState(formData.title || '');
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [endDate, setEndDate] = useState(formData.endDate || new Date());

  const handleNext = () => {
    // formData에 값 저장 후 다음 스텝으로 이동
    updateFormData({ title, startDate, endDate });
    nextStep();
  };

  return (
    <div className="BigMeeting-Start-form-container">
      <div className="BigMeeting-Start-form-box">
        <div className="BigMeeting-Start-form-icon"> <DiscussionIcon className="BigMeeting-Start-start-project-icon" /> </div>

        <h2>Start Meeting Project</h2>
        <p className="BigMeeting-Start-orm-description">
          Welcome Project! Please enter your details.
        </p>

        <div className="BigMeeting-Start-underSection">
            <label>Project Title</label>
            <input
            type="text"
            className='BigMeeting-Start-title-box'
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

export default BigMeetingStartProject;
