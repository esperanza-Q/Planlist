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
    if (!title.trim()) {
      setError('프로젝트 제목을 입력해주세요.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let projectId = formData.projectId;

      // 1️⃣ 프로젝트가 없으면 생성
      if (!projectId) {
        const createProjectRes = await axios.post(
          'http://localhost:8080/api/meeting/createProject',
          { title, start_week_date: startDate.toISOString().slice(0, 10) },
          { withCredentials: true }
        );

        console.log('프로젝트 생성 응답:', createProjectRes.data);

        // 서버 응답에 맞는 ID 선택
        projectId = createProjectRes.data.projectId || createProjectRes.data.plannerId;
        if (!projectId) throw new Error('프로젝트 ID를 서버에서 받아오지 못했습니다.');

        updateFormData({ ...formData, projectId });
      }

      // 2️⃣ 회차 생성 (필수 NOT NULL 필드 모두 포함)
      const payload = {
        projectId: projectId,
        subtitle: title,
        startDate: startDate.toISOString().slice(0, 10),
        endDate: startDate.toISOString().slice(0, 10),
        isRecurring: false,
        recurrenceCount: 0,
        recurrenceUnit: 'DAILY'
      };
      console.log('Add session payload (for server):', payload);

      const addSessionRes = await axios.post(
          'api/meeting/project/addSession',
          payload,
          { withCredentials: true }
        );

      console.log('회차 생성 응답:', addSessionRes.data);
      updateFormData({
        ...formData,
        sessionId: addSessionRes.data.plannerId || addSessionRes.data.sessionId,
        startDate: addSessionRes.data.startDate,
        endDate: addSessionRes.data.endDate
      });

      nextStep();

    } catch (err) {
      console.error('회차 생성 실패:', err);
      setError('회차 생성에 실패했습니다. 콘솔을 확인하세요.');
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
