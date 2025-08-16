import edit_icon from "../../assets/edit_icon.svg";
import ProfilePic from "../../assets/ProfilePic.png";

const PTInfoCard = ({ project = {} }) => {
  const users = Array.isArray(project.users) ? project.users : [];

  const onImgError = (e) => {
    if (e.currentTarget.src !== ProfilePic) {
      e.currentTarget.onerror = null;
      e.currentTarget.src = ProfilePic;
    }
  };

  return (
    <div className="info-card">
      <h2 className="card-title">{project.title || "PT Project"}</h2>
      {project.description ? (
        <p className="project-description">{project.description}</p>
      ) : null}

      <div className="friends-section">
        <div className="friends-small-list">
          {users.map((friend, index) => (
            <div className="friend-small" key={friend.name ?? index}>
              <img
                src={friend.avatar || ProfilePic}
                alt={friend.name || "Member"}
                className="friend-small-avatar"
                onError={onImgError}
              />
              <span className="friend-small-name">{friend.name || "Member"}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="meeting-edit-button" title="Edit">
        <img src={edit_icon} alt="" />
      </button>
    </div>
  );
};

export default PTInfoCard;
