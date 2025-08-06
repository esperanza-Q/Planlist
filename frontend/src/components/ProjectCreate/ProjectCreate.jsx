// ProjectCreate.jsx
import React, { useState } from "react";
import './ProjectCreate.css';
import StandardImg from '../../assets/Standard.png';
import MeetingImg from '../../assets/Meeting.png';
import TravelImg from '../../assets/Travel.png';
import PTImg from '../../assets/PT.png';
import { ReactComponent as CheckmarkIcon } from '../../assets/CheckmarkIcon.svg';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 'standard', name: 'Standard', img: StandardImg },
  { id: 'meeting', name: 'Meeting', img: MeetingImg },
  { id: 'travel', name: 'Travel', img: TravelImg },
  { id: 'pt', name: 'PT', img: PTImg },
];

const ProjectCreate = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) return;

    console.log("Navigating to:", `/project?category=${selected}`);
    navigate(`/project?category=${selected}`);
  };

  return (
    <div className="category-selector">
      <h2>Choose a category</h2>
      <div className="category-grid">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`category-card ${selected === cat.id ? 'selected' : ''}`}
            onClick={() => setSelected(cat.id)}
          >
            <div className="image-wrapper">
              <img src={cat.img} alt={cat.name} className="category-img" />
              {selected === cat.id && <CheckmarkIcon className="checkMark-icon" />}
            </div>
          </div>
        ))}
      </div>

      <button
        className="continue-button"
        onClick={handleContinue}
        disabled={!selected}
      >
        continue
      </button>
    </div>
  );
};

export default ProjectCreate;
