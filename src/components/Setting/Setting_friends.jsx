import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FriendItem } from "./FriendItem";
import { FriendRequestItem } from "./FriendRequestItem";
import "./Setting_friends.css";

function Setting_friends({setView}) {
  const [friendEmail, setFriendEmail] = useState("");
  const [friends, setFriends] = useState([
    { name: "John Doe", email: "john.doe@example.com" },
    { name: "Jane Smith", email: "jane.smith@example.com" },
    { name: "Robert Johnson", email: "robert@example.com" },
    { name: "Emily Davis", email: "emily@example.com" },
    { name: "Robert Johnson", email: "robert@example.com" }
   
  ]);
  
  const [friendRequests, setFriendRequests] = useState([
    { name: "Alex Wilson", email: "alex@example.com" },
    { name: "Sarah Miller", email: "sarah@example.com" }
  ]);

  const handleAddFriend = () => {
    if (!friendEmail) {
      alert("Please enter a friend's email");
      return;
    }
    
    alert(`Friend request sent to: ${friendEmail}`);
    setFriendEmail("");
  };

  return (
    <div className="friends-page">
      <div className="friends-content">
         {/* Tab Navigation */}
        <div className="tab" style={{ top: "223px", left: "249px" }}>
          <button onClick={() => setView('profile')}>
          <div className="tab-inactive">
            <div className="tab-active-text">
              profile
            </div>
          </div>
          </button>
        </div>



        <div className="tab" style={{ top: "222px", left: "319px" }}>
            
                <div className="tab-active">
                    <div className="tab-active-text">
                    friends
                    </div>
                </div>
            
            
        </div>

        {/* Friends List Card */}
        <div className="friends-list-card">
          <div className="friends-list-title">Friends</div>
          
          <div className="friends-list">
            {friends.map((friend, index) => (
              <FriendItem 
                key={index}
                name={friend.name} 
                email={friend.email} 
              />
            ))}
          </div>
        </div>

        {/* Add Friend Card */}
        <div className="add-friend-card">
          <div className="add-friend-form">
            <div className="email-input-container">
              <label className="email-label">Friend email</label>
              <input
                type="email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                className="email-input"
                placeholder="Enter friend's email"
              />
            </div>
            
            <button className="add-friend-button" onClick={handleAddFriend}>
              <div className="add-friend-text">add friend</div>
            </button>
          </div>
        </div>

        {/* Friend Requests Card */}
        <div className="friend-requests-card">
          <div className="friend-requests-title">Friend request</div>
          
          <div className="friend-requests-list">
            {friendRequests.map((request, index) => (
              <FriendRequestItem 
                key={index}
                name={request.name} 
                email={request.email} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Setting_friends;
