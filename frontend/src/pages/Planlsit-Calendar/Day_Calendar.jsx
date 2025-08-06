import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Day_Calendar.css';
import { format } from 'date-fns';

const DayCalendar = ({ currentDate, events }) => {
  const navigate = useNavigate();

  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  return (
    <div className="day-calendar-container">
      <div className="day-calendar-header">
        <span className="day-calendar-date">
          {format(currentDate, 'EEEE dd')}
        </span>
      </div>

      <div className="day-body-wrapper">
        <div className="day-hours-column">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="day-hour-label">
              {String(i).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        <div className="day-schedule-column">
          <div className="day-schedule-grid">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="day-time-slot" />
            ))}

            {events.map((event) => {
              const start = parseTime(event.startTime);
              const end = parseTime(event.endTime);
              const top = (start / 60) * 60;
              const height = ((end - start) / 60) * 60;

              return (
                <div
                  key={event.id}
                  className={`day-event-block event event-${event.color || 'blue'}`}
                  style={{ top: `${top}px`, height: `${height}px` }}
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  <div className="day-event-title">
                    • {event.title}
                  </div>
                  <div className="day-event-time">
                    {event.startTime} → {event.endTime}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayCalendar;
