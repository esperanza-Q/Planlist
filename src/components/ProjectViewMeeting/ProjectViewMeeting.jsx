import React from "react";
import { Link } from "react-router-dom";
import "./ProjectViewMeeting.css";
import ProfilePic from "../../assets/ProfilePic.png"
import edit_icon from "../../assets/edit_icon.svg"
import google_meets from "../../assets/google_meet_logo.svg"
import calendar_logo from "../../assets/calendar_logo.png"
import memo_trashbin from "../../assets/memo_trashbin.svg"
import arrow from "../../assets/arrow.svg"

export const ProjectViewMeeting = () => {
  return (
    <div className="project-info-container">
      <div className="project-content">
        {/* Navigation link to projects page */}
        <div className="absolute top-5 right-5">
          <Link to="/projects" className="text-[#334eac] font-semibold hover:underline">
            View All Projects →
          </Link>
        </div>
        
        {/* Project Info Card */}
        <div className="card project-info-card">
          <h2 className="card-title">Project Name</h2>
          <p className="project-description">simple information about the project</p>
          
          <div className="schedule-icon">
            <img src={calendar_logo} />
          </div>
          <div className="schedule-text">repeat every tuesday</div>
          
          <div className="friend-tags-container">
            <div className="friend-tag">
              
                <img src={ProfilePic} alt="Friend 1" />
              
              <span className="friend-name">friend 1</span>
            </div>
            
            
          </div>
          
          <div className="edit-project">edit project</div>
          <div className="edit-icon">
            <img src={edit_icon} alt="Edit" width="22" height="18" />
          </div>
          
          <div className="create-meeting-btn">
            <img src={google_meets} alt="Google Meet" />
            <span>Create Google Meet</span>
          </div>
        </div>
        
        {/* Meetings Card */}
        <div className="card meetings-card">
          <div className="meetings-header">
            <h2 className="meetings-title">Meetings</h2>
            <div className="add-meeting-btn">add meeting</div>
          </div>
          
          <div className="meeting-list">
            <div className="meeting-item">meeting 1</div>
            <div className="meeting-item">meeting 1</div>
            <div className="meeting-item">meeting 1</div>
            <div className="meeting-item">meeting 1</div>
          </div>
        </div>
        
        {/* Memo Card */}
        <div className="card memo-card">
          <h2 className="card-title">Memo</h2>
          
          <div className="memo-tabs">
            <div className="memo-tab">personal</div>
            <div className="memo-tab">group</div>
          </div>
          
          <div className="memo-list">
            <div className="memo-item">
              <h3 className="memo-project-title">Project 01</h3>
              <p className="memo-description">A short decription about context of this category goes here.</p>
              <div className="memo-category">Travel</div>
              <div className="memo-options">
                <img src={memo_trashbin} alt="Options" width="15" height="15" />
              </div>
              <div className="memo-delete">
                <img src={arrow} alt="Delete" width="14" height="14" />
              </div>
            </div>
            
            <div className="memo-item">
              <h3 className="memo-project-title">Project 01</h3>
              <p className="memo-description">A short decription about context of this category goes here.</p>
              <div className="memo-category">Travel</div>
              <div className="memo-options">
                <img src={memo_trashbin} alt="Options" width="15" height="15" />
              </div>
              <div className="memo-delete">
                <img src={arrow} alt="Delete" width="14" height="14" />
              </div>
            </div>
          </div> 
          
          <div className="add-memo-btn">Add Memo</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectViewMeeting;