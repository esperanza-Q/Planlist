
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DetailMeetingStartPage.css';

import { api } from '../../api/client';

import DiscussionIcon from '../../icons/DiscussionIcon';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { addDays, parseISO, isValid as isValidDate } from 'date-fns';

const DetailmeetingStartPage = ({ formData, updateFormData, nextStep }) => {
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
      alert("Please enter a title for your meeting project.");
      return;
    }

    const projectId = getProjectId(formData);
    if (!projectId) {
      alert("Missing project id from previous step. Please start from the meeting project first.");
      return;
    }

    const toYMD = (d) =>
      d instanceof Date
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
            d.getDate()
          ).padStart(2, '0')}`
        : d;

    try {
      // ✅ res를 변수에 담기
      const res = await api.postSession("/api/meeting/project/addSession", {
        projectId,
        title,
        startDate: toYMD(startDate),
        endDate: toYMD(endDate),
        isRecurring: 1,
        recurrenceUnit: "WEEKLY",
        recurrenceCount: 1,
      });

      // ✅ 응답 파싱
      const data = res?.data ?? res;
      const plannerId = data?.plannerId ?? null;

      // 세션 생성 성공 후 → 초대 API 호출
      await api.post(`/api/meeting/inviteUser/${projectId}/invite`, {
        email: "test@example.com", // 실제 값으로 교체
      });

      // 상태 조회 (GET)
      const inprogress = await api.get(
        `/api/meeting/inviteUser/${projectId}/inprogress`
      );
      console.log("inprogress:", inprogress);

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
      console.error("Failed to create meeting session:", e);
      alert("Failed to create meeting session. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <div className="form-icon"><DiscussionIcon/></div>

        <h2>Start meeting session</h2>
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

export default DetailmeetingStartPage;