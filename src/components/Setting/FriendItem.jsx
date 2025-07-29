import React from "react";
import "./FriendItem.css";
import ProfilePic from "../../assets/ProfilePic.png"
import check_circle from "../../assets/check_circle.svg"
import x_circle from "../../assets/x_circle.svg"

export const FriendItem = ({ name = "Name", email = "example@gmail.com" }) => {
  return (
    <div className="friend-item">
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
      
      <button 
        className="friend-delete-btn"
        onClick={() => alert(`Delete friend: ${name}`)}
      >
        <div className="delete-icon">
          <img 
          src={x_circle}
            alt="Delete" 
            className="delete-icon-inner"
          />
          
        </div>
      </button>
    </div>
  );
};
