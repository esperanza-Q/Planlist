import React, { useState } from 'react';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import '../MeetingCreatePage/BigMeetingStartProject.css';

import CubeAltIcon from '../../icons/CubeAltIcon';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

const StartProject = ({ formData, updateFormData, nextStep }) => {
  const [title, setTitle] = useState(formData.bigTitle || ''); // Big 프로젝트용

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleNext = async () => {
    if (!title.trim()) {
      setError('Please enter the project title');
      return;
    }
    setError('');

    try {
      setLoading(true);

      const res = await axios.post('/api/standard/createProject', {
        title
      });

      console.log('프로젝트 생성 응답:', res.data);

      // Big title로 저장
      updateFormData({
        bigTitle: title,
        projectId: res.data.projectId,
        creatorId: res.data.creator_id,
        category: res.data.category,
        status: res.data.status,
        createdAt: res.data.created_at
      });

      nextStep();
    } catch (err) {
      console.error('프로젝트 생성 실패:', err);
      alert('프로젝트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="BigMeeting-Start-form-container">
      <div className="BigMeeting-Start-form-box">
        <div className="BigMeeting-Start-form-icon">
          <CubeAltIcon className="BigMeeting-Start-start-project-icon" />
        </div>

        <h2>Start Standard Project</h2>
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
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      <button
        className="project-next-button"
        onClick={handleNext}
        disabled={loading}
      >
        {loading ? 'Loading...' : <ProjectNextIcon />}
      </button>
    </div>
  );
};

export default StartProject;
