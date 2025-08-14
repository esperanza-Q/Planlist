// src/components/Setting/ProfileTab/ProjectCard.jsx
import React, { useEffect, useState } from "react";

import check_circle from "../../../assets/check_circle.svg";
import x_circle from "../../../assets/x_circle.svg";
import ProfilePic from "../../../assets/ProfilePic.png";

const ProjectCard = ({ projectRequests }) => {
  const [requests, setRequests] = useState(projectRequests);

  // ✅ keep local state in sync when parent prop updates after fetch
  useEffect(() => {
    setRequests(projectRequests || []);
  }, [projectRequests]);

  const handleDecline = (indexToDecline) => {
    const updated = requests.filter((_, index) => index !== indexToDecline);
    setRequests(updated);
    alert("Decline project");
  };

  const handleAccept = (indexToAccept) => {
    const updated = requests.filter((_, index) => index !== indexToAccept);
    setRequests(updated);
    alert("Accept project");
  };

  return (
    <div className="project-card">
      <div className="project-card-title">Project request</div>
      <div className="project-item-container">
        {(requests || []).map((project, index) => (
          <div className="project-item" key={project?.invitee_id ?? index}>
            <img
              className="project-avatar"
              alt="Profile"
              src={project?.profile_image || ProfilePic}
              loading="lazy"
              onError={(e) => {
                if (e.currentTarget.src !== ProfilePic) {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = ProfilePic;
                }
              }}
            />

            <div className="project-name">
              {project?.projectTitle ?? "Project title"}
            </div>
            <div className="project-owner">
              {project?.creator ?? "creator"}
            </div>

            <button
              className="project-action-button accept"
              onClick={() => handleAccept(index)}
              title="Accept"
            >
              <img alt="accept" src={check_circle} />
            </button>

            <button
              className="project-action-button decline"
              onClick={() => handleDecline(index)}
              title="Delete"
            >
              <img alt="delete" src={x_circle} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectCard;
