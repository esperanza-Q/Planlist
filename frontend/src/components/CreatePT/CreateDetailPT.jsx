// src/components/CreatePT/DetailPTStartPage.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DetailPTStartPage.css';

import { api } from '../../api/client';
import PT_icon from '../../assets/dumbbell_icon.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { addDays, parseISO, isValid as isValidDate } from 'date-fns';

const DetailPTStartPage = ({ formData, updateFormData, nextStep }) => {
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
      alert("Please enter a title for your PT project.");
      return;
    }

    const projectId = getProjectId(formData);
    if (!projectId) {
      alert("Missing project id from previous step. Please start from the PT project first.");
      return;
    }

    try {
      const res = await api.postSession("/api/pt/project/addSession", {
        projectId,
        title,
        // send date-only strings if your backend expects that:
        // startDate: formatISO(startDate, { representation: 'date' }),
        // endDate: formatISO(endDate, { representation: 'date' }),
        startDate,
        endDate,
      });
      // try{
      //   await api.postSession(`/api/pt/inviteUser/${projectId}/upcoming`);
      // } catch (e) {
      //   await api.getSession(`/api/pt/inviteUser/${projectId}/upcoming`);

      // }

      // Response example: {"plannerId":14,"startDate":"2025-08-15","endDate":"2025-08-15"}
      const plannerId = res?.plannerId ?? null;

      // Prefer server dates if valid, else keep what user selected
      const srvStart = res?.startDate && isValidDate(parseISO(res.startDate))
        ? parseISO(res.startDate)
        : startDate;
      const srvEnd = res?.endDate && isValidDate(parseISO(res.endDate))
        ? parseISO(res.endDate)
        : endDate;

      // Persist everything needed for next step
      updateFormData({
        title,
        startDate: srvStart,
        endDate: srvEnd,
        projectId,
        plannerId,     // 🔴 <- key for Step 4
        session: res,  // optional: keep full response
      });

      nextStep();
    } catch (e) {
      console.error("Failed to create PT session:", e);
      alert("Failed to create PT session. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <div className="form-icon"><img src={PT_icon} alt="PT" /></div>

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

export default DetailPTStartPage;