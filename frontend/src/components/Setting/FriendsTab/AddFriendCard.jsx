import React, { useState } from "react";

const AddFriendCard = () => {
  const [friendEmail, setFriendEmail] = useState("");

  const handleAddFriend = () => {
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
