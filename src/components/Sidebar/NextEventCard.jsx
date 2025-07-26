import React, { useEffect, useState } from 'react';
import './NextEventCard.css';
import google_meet_logo from '../../assets/google_meet_logo.svg';
import bell from '../../assets/bell.svg';


const NextEventCard = () => {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    // 추후 실제 API 연동
    fetch('/api/next-event') 
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch(err => console.error('Failed to fetch event:', err));
  }, []);

  if (!event) return <div className='event-card'>No events to import</div>; // 로딩 중일 때 처리

  return (
    <div className="event-card">
      <div className="event-header">
        <img src={bell} alt="bell-icon" className="bell-icon" />
        <div className="event-title">
          <p className="event-label">Next Event</p>
          <p className="event-name">
            <span className="event-dot" /> {event.title}
          </p>
        </div>
      </div>

      <hr className="divider" />

      <div className="event-time">
        <div className="time-block">
          <p className="time">{event.startTime}</p>
          <p className="ampm">AM</p>
        </div>
        <div className="time-arrow">⇄</div>
        <div className="time-block">
          <p className="time">{event.endTime}</p>
          <p className="ampm">AM</p>
        </div>
      </div>

      <a href={event.link} className="meet-link" target="_blank" rel="noreferrer">
        <img src={google_meet_logo} alt="Meeticon" className="meet-icon" />
        Go to meet link
      </a>
    </div>
  );
};

export default NextEventCard;
