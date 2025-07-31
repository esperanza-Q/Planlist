import React,  { useState } from "react";

import ProfilePic from "../../../assets/ProfilePic.png"
import edit_icon from "../../../assets/edit_icon.svg"
import check_circle from "../../../assets/check_circle.svg"
import x_circle from "../../../assets/x_circle.svg"

const FriendRequestCard = ({friendRequests}) => {
  const [requests, setRequests] = useState(friendRequests);
  
  const handleDecline = (indexToDecline) => {
    const updated = requests.filter((_, index) => index !== indexToDecline);
    setRequests(updated);
    alert("Decline friend");
  };

  const handleAccept = (indexToAccept) => {
    const updated = requests.filter((_, index) => index !== indexToAccept);
    setRequests(updated);
    alert("Accept friend");
  };

  return (
    <div className ="friend-request-card">
      <div className="friend-request-card-title">Friend Request</div>
      <div className="friend-request-item-container">
        {requests.map((friend,index) =>(
          <div className="friend-request-item" key={index}>
            <img
              className="friend-avatar"
              alt="Profile"
              src={friend.profile_image}
            />

            <div className="friend-name">
              {friend.name}
            </div>

            <div className="friend-email">
              {friend.email}  
            </div>

            <button 
              className="action-button accept"
              onClick={() => handleAccept(index)}
              title="Accept"
            >
              <img alt="check" src={check_circle}/>
            </button>

            <button 
              className="action-button decline"
              onClick={() => handleDecline(index)}
              title="Decline"
            >
              <img alt="delete" src={x_circle}/>
            </button>


          </div>
        ))}
      </div>
      
    
   
      
    </div>
    
  );
};


export default FriendRequestCard;