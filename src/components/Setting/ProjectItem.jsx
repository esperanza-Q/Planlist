import React from "react";
import "./ProjectItem.css";
import check_circle from "../../assets/check_circle.svg"
import x_circle from "../../assets/x_circle.svg"
import ProfilePic from "../../assets/ProfilePic.png"

export const ProjectItem = ({ top }) => {
  return (
    <div className="project-item-container">
      <div className="project-avatar" style={{ top: `${top}px`, left: "76px" }}>
        <img
          alt="Profile"
          src={ProfilePic}
        />
      </div>

      <div className="project-info" style={{ top: `${top + 4}px`, left: "171px" }}>
        <div className="project-info-inner">
          <div className="project-name">
            Project name
          </div>
          <div className="project-owner">
            name
          </div>
        </div>
      </div>

      
      <button 
        className="action-button"
        style={{ top: `${top + 19}px`, left: "623px" }}
        onClick={() => alert("Accept project")}
        title="Accept"
      >
        <div className="accept-button">
          <img
            alt="Delete"
            src={check_circle}
          />
          
        </div>
      </button>

      <button 
        className="action-button"
        style={{ top: `${top + 19}px`, left: "667px" }}
        onClick={() => alert("Decline project")}
        title="Decline"
      >
        <div className="delete-button">
          <img
            alt="Delete"
            src={x_circle}
          />
          
        </div>
      </button>
    </div>
  );
};
