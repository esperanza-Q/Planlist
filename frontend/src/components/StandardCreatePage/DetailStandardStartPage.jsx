
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../MeetingCreatePage/DetailMeetingStartPage.css';

import { api } from '../../api/client';

import CubeAltIcon from '../../icons/CubeAltIcon';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { addDays, parseISO, isValid as isValidDate } from 'date-fns';

const DetailstandardStartPage = ({ formData, updateFormData, nextStep }) => {
  const [title, setTitle] = useState(formData.title || '');
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [endDate, setEndDate] = useState(formData.endDate || addDays(new Date(), 7));

  const getProjectId = (fd) =>
    fd?.projectId ?? fd?.project?.id ?? fd?.project?.projectId ?? null;

  const handleStartChange = (date) => {
    setStartDate(date);
    if (date) setEndDate(addDays(date, 7)); // keep +7 UX
  };

  const handleNext = async () => {
    if (!title.trim()) {
      alert("Please enter a title for your standard project.");
      return;
    }

    const projectId = getProjectId(formData);
    if (!projectId) {
      alert("Missing project id from previous step. Please start from the standard project first.");
      return;
    }

    try {
      const res = await api.postSession("/api/standard/project/addSession", {
        projectId,
        title,
        startDate,
        endDate,
        isRecurring : 1,
        recurrenceUnit : "WEEKLY",
        recurrenceCount:1
      });

      const plannerId = res?.plannerId ?? null;

      // 세션 생성 성공 후 → 초대 API 호출
      try {
        await api.post(`/api/standard/inviteUser/${projectId}/invite`, {
          email: "test@example.com" // 실제 초대 대상
        });
      } catch (e) {
        console.error("유저 초대 실패:", e);
      }

      // 조회하고 싶다면 GET 사용
      // const confirm = await api.get(`/api/standard/inviteUser/${projectId}/inprogress`);

      updateFormData({
        title,
        startDate,
        endDate,
        projectId,
        plannerId,
        session: res,
      });

      nextStep();
    } catch (e) {
      console.error("Failed to create standard session:", e);
      alert("Failed to create standard session. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <div className="form-icon"><CubeAltIcon/></div>

        <h2>Start Standard session</h2>
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
          <div className="meeting-date-picker-wrapper">
            <DatePicker
              selected={startDate}
              onChange={handleStartChange}
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
              disabled
            />
          </div>
        </div>
      </div>

      <button className="project-next-button" onClick={handleNext}>
        <ProjectNextIcon />
      </button>
    </div>
  );
};

export default DetailstandardStartPage;