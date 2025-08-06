import React, { useMemo } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import './Week_Calendar.css';
import { useNavigate } from 'react-router-dom';

const hours = Array.from({ length: 24 }, (_, i) => i);

const WeekCalendar = ({ currentDate, events }) => {
  const navigate = useNavigate();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); 
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const getHour = (timeStr) => parseInt(timeStr.split(':')[0], 10);

  return (
    <div className="week-calendar">
      <h2 className="week-calendar-title">{format(currentDate, 'MMMM yyyy')}</h2>
      <div className="week-calendar-grid">
        <div className="header-row">
          <div className="time-cell" />
          {days.map((day) => (
            <div key={day} className="day-header">
              {format(day, 'EEEE dd')}
            </div>
          ))}
        </div>

        {hours.map((hour) => (
          <div className="row" key={hour}>
            <div className="time-cell">
              {hour === 0
                ? '12 AM'
                : hour < 12
                ? `${hour} AM`
                : hour === 12
                ? '12 PM'
                : `${hour - 12} PM`}
            </div>

            {days.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');

              const dayEvents = events.filter((event) => {
                const eventDate = event.date || event.startDate || event.start;
                const eventDay = format(new Date(eventDate), 'yyyy-MM-dd');
                const eventHour = getHour(event.startTime);
                return eventDay === dayStr && eventHour === hour;
              });

              return (
                <div key={dayStr + hour} className="week-cell">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`event event-${event.color || 'blue'}`}
                      onClick={() => navigate(`/event/${event.id}`)}
                    >  
                     • {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekCalendar;
