// FriendRequestCard.jsx
import React, { useState } from "react";
import ProfilePic from "../../../assets/ProfilePic.png";
import check_circle from "../../../assets/check_circle.svg";
import x_circle from "../../../assets/x_circle.svg";

const FriendRequestCard = ({ friendRequests = [], onAccept, onDecline }) => {
  // track which rows are loading (by key)
  const [accepting, setAccepting] = useState(new Set());

  const rowKey = (friend, index) => friend.id ?? friend.email ?? index;

  const handleAcceptClick = async (friend, key) => {
    setAccepting(prev => new Set(prev).add(key));
    try {
      await onAccept?.(friend);
    } finally {
      setAccepting(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleDeclineClick = async (friend, key) => {
    setAccepting(prev => new Set(prev).add(key)); // optional lock
    try {
      await onDecline?.(friend);
    } finally {
      setAccepting(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  return (
    <div className="friend-request-card">
      <div className="friend-request-card-title">Friend Request</div>
      <div className="friend-request-item-container">
        {friendRequests.length === 0 && (
          <div className="friend-request-empty">No pending requests.</div>
        )}

        {friendRequests.map((friend, index) => {
          const key = rowKey(friend, index);
          const isLoading = accepting.has(key);

          return (
            <div className="friend-request-item" key={friend.email || key}>
              <img
                className="friend-avatar"
                alt="Profile"
                src={friend.profile_image || ProfilePic}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = ProfilePic;
                }}
              />
              <div className="friend-name">{friend.name}</div>
              <div className="friend-email">{friend.email}</div>

              <button
                className={`action-button accept${isLoading ? " is-loading" : ""}`}
                onClick={() => handleAcceptClick(friend, key)}
                title="Accept"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? <span className="spinner" aria-hidden="true" /> : <img alt="check" src={check_circle} />}
              </button>

              <button
                className="action-button decline"
                onClick={() => handleDeclineClick(friend, key)}
                title="Decline"
                disabled={isLoading}
              >
                <img alt="delete" src={x_circle} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FriendRequestCard;
