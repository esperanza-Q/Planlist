import React from "react";
import "./FriendRequestItem.css";
import ProfilePic from "../../assets/ProfilePic.png"
import edit_icon from "../../assets/edit_icon.svg"
import check_circle from "../../assets/check_circle.svg"
import x_circle from "../../assets/x_circle.svg"


export const FriendRequestItem = ({ name = "Name", email = "example@gmail.com" }) => {
  return (
    <div className="friend-request-item">
      <div className="friend-avatar">
        <img
          src={ProfilePic}
          alt="Profile"
        />
      </div>
      
      <div className="friend-info">
        <div className="friend-name">{name}</div>
        <div className="friend-email">{email}</div>
      </div>
      
      <div className="friend-actions">
        <button 
          className="approve-btn"
          onClick={() => alert(`Approve friend request: ${name}`)}
        >
          <div className="approve-icon">
            <img 
              src={check_circle}
              alt="Approve" 
            />
          </div>
        </button>
        
        <button 
          className="reject-btn"
          onClick={() => alert(`Reject friend request: ${name}`)}
        >
          <div className="reject-icon">
            <img 
              src={x_circle}
              alt="Reject" 
              className="reject-icon-inner"
            />
            
          </div>
        </button>
      </div>
    </div>
  );
};