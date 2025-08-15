// src/components/PT/PTDetailInfoCard.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";

import edit_icon from "../../assets/edit_icon.svg";
import google_meets from "../../assets/google_meet_logo.svg";
import calendar_icon from "../../assets/calendar_icon.svg";
import location_icon from "../../assets/location_icon.svg";
import DefaultProfilePic from "../../assets/ProfilePic.png";

const toDate = (d) => {
  if (!d) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;               // already YYYY-MM-DD
  const dt = new Date(d);
  return isNaN(dt) ? String(d) : dt.toISOString().slice(0, 10);
};
const toTime = (t) => {
  if (!t || typeof t !== "string") return null;
  const m = t.match(/^(\d{2}):(\d{2})/);                      // "HH:mm:ss" -> "HH:mm"
  return m ? `${m[1]}:${m[2]}` : t;
};

const PTDetailInfoCard = ({ project }) => {
  const p = project ?? {};
  const title = p.title ?? "Untitled session";
  const description = p.description ?? "";

  const startDate = toDate(p.startDate) ?? "TBD";
  const startTime = toTime(p.startTime) ?? "TBD";
  const endTime   = p.endTime && p.endTime !== "none" ? toTime(p.endTime) : null;
  const repeat    = p.repeat ?? "none";

  const users = Array.isArray(p.users) ? p.users : [];

  const timeline = useMemo(() => {
    return endTime ? `${startDate}  ${startTime} ~ ${endTime}` : `${startDate}  ${startTime}`;
  }, [startDate, startTime, endTime]);

  return (
    <div className="info-card">
      <h2 className="card-title">{title}</h2>
      {description && <p className="project-description">{description}</p>}

      <div className="info-container">
        <img src={calendar_icon} className="icon" alt="calendar" />
        <div className="info-text">
          <div className="project-info">{timeline}</div>
          <div className="project-subinfo">
            {repeat === "none" ? "no repeat" : `repeat every ${repeat}`}
          </div>
        </div>
      </div>

      <div className="friends-section">
        <div className="friends-small-list">
          {users.length === 0 ? (
            <div className="friend-small" style={{ opacity: 0.7 }}>
              <img src={DefaultProfilePic} className="friend-small-avatar" alt="no participants" />
              <span className="friend-small-name">No participants yet</span>
            </div>
          ) : (
            users.map((friend, i) => {
              const name = friend?.name ?? `Member ${i + 1}`;
              const avatar = friend?.avatar || DefaultProfilePic;
              return (
                <div className="friend-small" key={`${name}-${i}`}>
                  <img
                    src={avatar}
                    alt={name}
                    className="friend-small-avatar"
                    onError={(e) => (e.currentTarget.src = DefaultProfilePic)}
                  />
                  <span className="friend-small-name">{name}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <button className="meeting-edit-button" type="button" title="Edit">
        <img src={edit_icon} alt="edit" />
      </button>
    </div>
  );
};

PTDetailInfoCard.propTypes = {
  project: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    repeat: PropTypes.string,
    users: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        avatar: PropTypes.string,
      })
    ),
  }),
};

PTDetailInfoCard.defaultProps = {
  project: null,
};

export default PTDetailInfoCard;
