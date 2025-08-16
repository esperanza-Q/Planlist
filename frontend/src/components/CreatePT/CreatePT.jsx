// CreatePT.jsx
import React, { useState } from 'react';
import './StartProject.css';
import PT_icon from '../../assets/dumbbell_icon.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { api } from "../../api/client";

const CreatePT = ({ formData, updateFormData, nextStep }) => {
  const [title, setTitle] = useState(formData.title || '');
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [endDate, setEndDate] = useState(formData.endDate || new Date());
  const [isTrainer, setIsTrainer] = useState(!!formData.isTrainer);

  const handleNext = async () => {
    if (!title.trim()) {
      alert("Please enter a title for your PT project.");
      return;
    }

    try {
      const project = await api.postSession("/api/pt/createProject", {
        title,
        role: isTrainer ? "TRAINER" : "TRAINEE",
      });
      // project is expected to be:
      // { projectId, creatorId, title, category, status, createdAt }

      updateFormData({
        title,           // normalize key name
        startDate,
        endDate,
        isTrainer,
        project,         // keep the whole payload for later steps
        projectId: project?.projectId, // convenience field
      });

      nextStep();
    } catch (e) {
      console.error("Failed to send PT creation request:", e);
      alert("Failed to create PT project. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box" style={{ height: "525px" }}>
        <div className="form-icon"><img src={PT_icon} alt="PT" /></div>

        <h2>Start PT Project</h2>
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

          <div className="underSection" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="checkbox">
              <input
                id="is-trainer"
                type="checkbox"
                checked={isTrainer}
                onChange={(e) => setIsTrainer(e.target.checked)}
              />
              <label htmlFor="is-trainer">I’m the trainer</label>
            </div>
          </div>
        </div>
      </div>

      <button className="project-next-button" onClick={handleNext}>
        <ProjectNextIcon />
      </button>
    </div>
  );
};

export default CreatePT;
