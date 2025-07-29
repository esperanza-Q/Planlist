import React, { useMemo } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import './Week_Calendar.css';
import { useNavigate } from 'react-router-dom';

// ✅ 0~23시로 확장
const hours = Array.from({ length: 24 }, (_, i) => i);

const WeekCalendar = ({ currentDate, events }) => {
  const navigate = useNavigate();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday 기준
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // "12:30" → 12
  const getHour = (timeStr) => parseInt(timeStr.split(':')[0], 10);

  return (
    <div className="week-calendar">
      <div className="calendar-grid">
        {/* 헤더: 요일 */}
        <div className="header-row">
          <div className="time-cell" />
          {days.map((day) => (
            <div key={day} className="day-header">
              {format(day, 'EEEE dd')}
            </div>
          ))}
        </div>

        {/* 시간별 줄 */}
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
                <div key={dayStr + hour} className="cell">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`event event-${event.color || 'blue'}`}
                      onClick={() => navigate(`/event/${event.id}`)}
                    >
                      {event.title}
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
