import React, { useState } from "react";
import { api } from "../../../api/client";

const AddFriendCard = () => {
  const [friendEmail, setFriendEmail] = useState("");

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendEmail) {
      alert("Please enter a friend's email.");
      return;
    }
    try {
      await api.postSession("/api/settings/friend/sendRequest", {
        email: friendEmail,   // adjust key if your DTO uses a different name
      });
    }
    catch (e) {
      console.error("Error sending friend request:", e);
      alert("Failed to send friend request. Please try again.");
      return;
    }
    
    alert(`Friend request sent to: ${friendEmail}`);
    setFriendEmail("");
  };

  return (
    <div className="add-friend-card">
      <div className="add-friend-email">Friend email</div>

      <input
        type="email"
        value={friendEmail}
        onChange={(e) => setFriendEmail(e.target.value)}
        className="email-input"
        placeholder="Enter friend's email"
      />

      <button className="add-friend-button" onClick={handleAddFriend}> 
        add friend
      </button>
    </div>
  );
};

export default AddFriendCard;
