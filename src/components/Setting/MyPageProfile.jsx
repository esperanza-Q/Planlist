import React, { useState } from "react";
import { ProjectItem } from "./ProjectItem.jsx";
import './MyPageProfile.css';
import {Link} from "react-router-dom";
import ProfilePic from "../../assets/ProfilePic.png"
import edit_icon from "../../assets/edit_icon.svg"

const MypageProfile = ({setView}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      alert("Please fill in both password fields");
      return;
    }
    
    alert(`Password change requested. Old: ${oldPassword}, New: ${newPassword}`);
    // In a real app, you would call an API here
    setOldPassword("");
    setNewPassword("");
  };

  return (
    <div className="mypage-container" data-model-id="80:160">
      <div className="mypage-content">
        {/* Tab Navigation */}
        <div className="tab" style={{ top: "223px", left: "249px" }}>
          
          <div className="tab-active">
            <div className="tab-active-text">
              profile
            </div>
          </div>
        </div>



        <div className="tab" style={{ top: "222px", left: "319px" }}>
            <button onClick={() => setView('friends')}>
                <div className="tab-inactive">
                    <div className="tab-active-text">
                    friends
                    </div>
            </div>
            </button>

        

        </div>

        

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            <img
              alt="Profile"
              src={ProfilePic}
            />
          </div>

          <button className="change-password-button" onClick={handleChangePassword}>
            <div className="change-password-text">
              change password
            </div>
          </button>

          <div className="profile-info">
            <div className="profile-info-inner">
              <div className="profile-name">
                Name
              </div>
              <a
                className="profile-email"
                href="mailto:example@gmail.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                example@gmail.com
              </a>
            </div>
          </div>

          <div className="password-field" style={{ top: "221px" }}>
            <div className="password-label">
              old password
            </div>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="password-input"
              placeholder="Enter your current password"
            />
          </div>

          <div className="password-field" style={{ top: "310px" }}>
            <div className="password-label">
              new password
            </div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="password-input"
              placeholder="Enter your new password"
            />
          </div>

          <button className="edit-button" onClick={() => alert("Edit profile")} title="Edit Profile">
            <img
              alt="Edit"
              src={edit_icon}
            />
          </button>
          {/* Logout Button */}
        <div className="logout-button">
          <button 
            className="logout-text"
            onClick={() => alert("Logout clicked")}
          >
            logout
          </button>
        </div>
        </div>

        {/* Project Requests Card */}
        <div className="project-card">
          <div className="project-card-title">
            Project request
          </div>

          {/* First Project Item */}
          <ProjectItem top={131} />

          {/* Second Project Item */}
          <ProjectItem top={231} />


        </div>

        
      </div>
    </div>
    
  );
};


export default MypageProfile;