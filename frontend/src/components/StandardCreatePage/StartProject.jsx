import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './StartProject.css';

import CubeAltIcon from '../../icons/CubeAltIcon';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

import { api } from "../../api/client";

function formatDateYYYYMMDD(date) {
  // 로컬 기준으로 YYYY-MM-DD 문자열 만들기 (타임존 밀림 방지)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const StartProject = ({ formData, updateFormData, nextStep }) => {
  const [title, setTitle] = useState(formData.title || '');
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    if (!title.trim()) {
      setError('프로젝트 제목을 입력해주세요.');
      return;
    }
    if (!startDate) {
      setError('시작 주에 포함될 날짜를 선택해주세요.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        start_week_date: formatDateYYYYMMDD(startDate),
      };
      
      const data = await api.post('/api/standard', payload);
      updateFormData({
        title: data.title,
        startDate: startDate,                      // 사용자가 고른 기준일
        weekRange: data.start_week_date,           // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
        plannerId: data.planner_id,
        serverMessage: data.message,
      });

      nextStep();
    } catch (e) {
      setError(e.message || '서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <div className="form-icon"><CubeAltIcon className="start-project-icon" /></div>

        <h2>Start Standard Project</h2>
        <p className="form-description">Welcome Project! Please enter your details.</p>

        <div className="underSection">
          <label>Project Title</label>
          <input
            type="text"
            className="title-box"
            placeholder="Enter your title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label>Choose a date to start the schedule</label>
          <div className="date-picker-wrapper">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
            />
          </div>

          {error && <div className="error-text">{error}</div>}
        </div>
      </div>

      <button className="project-next-button" onClick={handleNext} disabled={loading}>
        <ProjectNextIcon />
      </button>
    </div>
  );
};

export default StartProject;
