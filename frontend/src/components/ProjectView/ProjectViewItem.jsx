// ProjectViewItem.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectView.css";
import ProfileOverflow from '../../assets/profile_overflow.svg';
import DefaultProfilePic from "../../assets/ProfilePic.png";

const ProjectViewItem = ({ project }) => {
  const navigate = useNavigate();

  const imgFallback = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = DefaultProfilePic;
  };

  const norm = (v) => (v ?? "").toString().trim().toLowerCase();
  const statusIsInProgress = () => {
    const s = norm(project?.status).replace(/[_-]/g, " ");
    return s === "in progress" || s.includes("in progress");
  };

  const handleClick = () => {
    const id = project?.id ?? project?.projectId;
    if (!id) {
      console.warn("Project id missing on ProjectViewItem click");
      return;
    }

    const category = norm(project?.category);

    // --- PT routing with details when in-progress ---
    if (category === "pt") {
      if (statusIsInProgress()) {
        // pass projectId via query string
        navigate(`/project/pt/details?projectId=${encodeURIComponent(id)}`);
        // (Alternate: via state)
        // navigate("/project/pt/details", { state: { projectId: id } });
        return;
      }
      navigate(`/project/pt?projectId=${encodeURIComponent(id)}`);
      return;
    }

    // --- Other categories (unchanged) ---
    switch (category) {
      case "travel":
        navigate(`/project/travel?projectId=${encodeURIComponent(id)}`);
        break;
      case "meeting":
        navigate(`/project/meeting?projectId=${encodeURIComponent(id)}`);
        break;
      default:
        navigate(`/project/standard?projectId=${encodeURIComponent(id)}`);
    }
  };

  return (
    <div className="ItemDiv" onClick={handleClick}>
      <div className="title">{project.title}</div>

      <div className="project-status-indicator">
        <span className={`status-circle ${project.status?.replace(" ", "-")}`} title={project.status}></span>
        <span className={`status-label ${project.status?.replace(" ", "-")}`}>{project.status}</span>
      </div>

      <div className="userContainer">
        <div className="user">
          {project.users && project.users.slice(0, 6).map((user, index) => {
            const isLastVisible = index === 5 && project.users.length > 5;
            return isLastVisible ? (
              <img key="overflow" src={ProfileOverflow} alt="More users" className="user-avatar" title="More users" />
            ) : (
              <img
                key={index}
                src={user.avatar}
                alt={user.name || "User"}
                className="user-avatar"
                title={user.name}
                onError={imgFallback}
              />
            );
          })}
        </div>
      </div>

      <div className="category">{project.category}</div>
      <div className="dates">{project.startDate} ~ {project.endDate}</div>
    </div>
  );
};

export default ProjectViewItem;
