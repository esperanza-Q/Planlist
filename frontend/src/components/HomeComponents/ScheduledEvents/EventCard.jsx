import React from "react";
import "./ScheduledEvents.css";

const EventCard = ({ icon, count, label, bgColor }) => {
  return (
    <div className="section-event-card">
      <div className="event-icon" style={{ backgroundColor: bgColor }}>
        <img src={icon} alt={label} />
      </div>
      <div className="event-info">
        <h2>{count}</h2>
        <p>{label}</p>
      </div>
    </div>
  );
};

export default EventCard;
