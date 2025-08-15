import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DetailMeetingStartPage.css';
import axios from 'axios';

import DiscussionIcon from '../../icons/DiscussionIcon';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

const DetailMeetingStartPage = ({ formData, updateFormData, nextStep }) => {
  const [title, setTitle] = useState(formData.subTitle || '');
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNext = async () => {
    if (!title) {
      setError('프로젝트 제목을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ 주간 반복 시작 프로젝트 생성 API 호출
      const createResponse = await axios.post('http://localhost:8080/api/meeting/createProject', {
        title: title,
        start_week_date: startDate.toISOString().slice(0, 10),
      }, {
        withCredentials: true // 세션/쿠키 기반이면 필요
      });


      console.log('Create project response:', createResponse.data);

      // 2️⃣ formData 업데이트
      updateFormData({
        subTitle: title,
        startDate,
        projectId: createResponse.data.planner_id, // 서버 응답 planner_id
      });

      nextStep(); // 다음 스텝으로 이동
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('프로젝트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <div className="form-icon">
          <DiscussionIcon className="BigMeeting-Start-start-project-icon" />
        </div>

        <h2>Start Detail Meeting Project</h2>
        <p className="form-description">
          Enter a specific topic under the main project.
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

          <label>Select the week start</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
          />
        </div>

        {error && <p className="error">{error}</p>}
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

export default DetailMeetingStartPage;
