import React from "react";
import ProfilePic from "../../../assets/ProfilePic.png";
import x_circle from "../../../assets/x_circle.svg";

const FriendCard = ({ friends = [], onDelete, deletingKeys }) => {
  const rowKey = (f, i) => f?.id ?? f?.email ?? i;

  return (
    <div className="friend-card">
      <div className="friend-request-card-title">Friends</div>
      <div className="friend-request-item-container">
        {friends.map((friend, index) => {
          const key = rowKey(friend, index);
          const isDeleting = deletingKeys?.has?.(key);

          return (
            <div className="friend-request-item" key={friend.email || friend.id || index}>
              <img className="friend-avatar" alt="Profile" src={friend.profile_image || ProfilePic} />
              <div className="friend-name">{friend.name}</div>
              <div className="friend-email">{friend.displayEmail}</div> {/* show displayEmail */}
              <button
                className={`action-button decline${isDeleting ? " is-loading" : ""}`}
                onClick={() => onDelete(friend)}
                disabled={isDeleting}
                aria-busy={isDeleting}
                title="Remove friend"
              >
                {isDeleting ? <span className="spinner" /> : <img alt="delete" src={x_circle} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FriendCard;
