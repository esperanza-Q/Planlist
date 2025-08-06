import React,  { useState } from "react";

import ProfilePic from "../../../assets/ProfilePic.png"
import edit_icon from "../../../assets/edit_icon.svg"
import check_circle from "../../../assets/check_circle.svg"
import x_circle from "../../../assets/x_circle.svg"


const FriendCard = ({friends}) => {
  const [requests, setRequests] = useState(friends);
  
  const handleDelete = (indexToDecline) => {
    const updated = requests.filter((_, index) => index !== indexToDecline);
    setRequests(updated);
    alert("Delete friend");
  };



  return (
    <div className ="friend-card">
      <div className="friend-request-card-title">Friends</div>
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
              className="action-button decline"
              onClick={() => handleDelete(index)}
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


export default FriendCard;