import React, { useState } from 'react';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import './BigMeetingStartProject.css';

import DiscussionIcon from '../../icons/DiscussionIcon';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

const BigMeetingStartProject = ({ formData, updateFormData, nextStep }) => {
  const [title, setTitle] = useState(formData.title || '');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    try {
      setLoading(true);

      // 서버에 프로젝트 생성 요청 (title만 전송)
      const res = await axios.post('/api/meeting/createProject', {
        title
      });

      console.log('프로젝트 생성 응답:', res.data);

      // formData 업데이트 (응답 데이터 포함)
      updateFormData({
        title,
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
          <DiscussionIcon className="BigMeeting-Start-start-project-icon" />
        </div>

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

      {/* 다음 버튼 */}
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

export default BigMeetingStartProject;
