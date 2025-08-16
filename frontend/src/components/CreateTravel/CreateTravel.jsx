// src/components/CreateTravel/CreateTravel.jsx
import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import "../StandardCreatePage/StartProject.css";

import travel_icon from "../../assets/travel_icon.svg";
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { api } from "../../api/client";

const CreateTravel = ({ formData, updateFormData, nextStep }) => {
  const [TravelTitle, setTitle] = useState(formData.title || "");
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [endDate, setEndDate] = useState(formData.endDate || new Date());

  const handleNext = async () => {
    if (!TravelTitle.trim()) {
      alert("Please enter a title for your travel project.");
      return;
    }
    try {
      const project = await api.postSession("/api/travel/createProject", {
        title: TravelTitle.trim(),
      });

      updateFormData({
        title: TravelTitle.trim(),
        startDate,
        endDate,
        project,
        projectId: project?.projectId,
      });

      nextStep();
    } catch (e) {
      console.error("Failed to send travel creation request:", e);
      alert("Failed to create travel project. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box" style={{ height: "459px" }}>
        <div className="form-icon">
          <img src={travel_icon} alt="Travel" />
        </div>

        <h2>Start Travel Project</h2>
        <p className="form-description">
          Welcome Project! Please enter your details.
        </p>

        <div className="underSection">
          <label>Project Title</label>
          <input
            type="text"
            className="title-box"
            placeholder="Enter your title"
            value={TravelTitle}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      <button type="button" className="project-next-button" onClick={handleNext}>
        <ProjectNextIcon />
      </button>
    </div>
  );
};

export default CreateTravel;
