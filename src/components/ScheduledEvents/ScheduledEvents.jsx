import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import Upcoming_event from '../../assets/Upcoming_event.svg';
import In_progress_event from '../../assets/In_progress_event.svg';
import Finished_event from '../../assets/Finished_event.svg';

import "./ScheduledEvents.css";

const ScheduledEvents = () => {
  const [eventData, setEventData] = useState(null);

  
  // 실제 API 넣기
  useEffect(() => {
    fetch("/api/scheduled-events") 
      .then((res) => res.json())
      .then((data) => setEventData(data))
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  if (!eventData) return (
    <div className="second-section"> 
        <h2 className="home-section-title">Scheduled Events</h2>
        <div className="scheduled-events">
        <EventCard
            icon={Upcoming_event}
            count="0"
            label="Upcoming Event"
            bgColor="#FFF9F0"
        />
        <EventCard
            icon={In_progress_event}
            count="0"
            label="In-progress Event"
            bgColor="#BAD6EB"
        />
        <EventCard
            icon={Finished_event}
            count="0"
            label="Finished Event"
            bgColor="#7096D1"
        />
        </div>
    </div>
  );;

  return (
    <div className="second-section"> 
        <h2 className="home-section-title">Scheduled Events</h2>
        <div className="scheduled-events">
        <EventCard
            icon={Upcoming_event}
            count={eventData.upcoming}
            label="Upcoming Event"
            bgColor="#FFF9F0"
        />
        <EventCard
            icon={In_progress_event}
            count={eventData.inProgress}
            label="In-progress Event"
            bgColor="#BAD6EB"
        />
        <EventCard
            icon={Finished_event}
            count={eventData.finished}
            label="Finished Event"
            bgColor="#7096D1"
        />
        </div>
    </div>
  );
};

export default ScheduledEvents;
