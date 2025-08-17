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
  // Normalize incoming startDate into a Date object
  const normalizeDate = (d) => {
    if (!d) return new Date();
    if (d instanceof Date) return d;
    const parsed = parseISO(String(d));
    return isValidDate(parsed) ? parsed : new Date();
  };

  const [title, setTitle] = useState(formData.title || '');
  const [startDate, setStartDate] = useState(normalizeDate(formData.startDate));

  // Always compute endDate from startDate (+7 days)
  const computedEndDate = addDays(startDate, 7);

  const getProjectId = (fd) =>
    fd?.projectId ?? fd?.project?.id ?? fd?.project?.projectId ?? null;

  const handleStartChange = (date) => {
    // Changing start date automatically shifts end date via computedEndDate
    setStartDate(date || new Date());
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
        // If your backend needs date-only strings, convert before sending:
        // startDate: formatISO(startDate, { representation: 'date' }),
        // endDate:   formatISO(computedEndDate, { representation: 'date' }),
        startDate,
        endDate: computedEndDate,
      });

      const srvStart = res?.startDate && isValidDate(parseISO(res.startDate))
        ? parseISO(res.startDate)
        : startDate;

      // Enforce rule: end = start + 7 (ignore server end if provided)
      const srvEnd = addDays(srvStart, 7);

      updateFormData({
        title,
        startDate: srvStart,
        endDate: srvEnd,
        projectId,
        plannerId: res?.plannerId ?? null,  // key for the next step(s)
        session: res,                        // optional: keep full response
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
              endDate={computedEndDate}
            />
            <span> ~ </span>
            <DatePicker
              selected={computedEndDate}
              // We keep this disabled so users can't change it independently
              disabled
              selectsEnd
              startDate={startDate}
              endDate={computedEndDate}
              minDate={startDate}
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
