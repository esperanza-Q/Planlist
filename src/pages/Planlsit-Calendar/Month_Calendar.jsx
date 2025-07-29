import React, { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSunday,
} from 'date-fns';
import './Month_Calendar.css';
import { useNavigate } from 'react-router-dom';

const MonthCalendar = ({ currentDate, events }) => {
  const navigate = useNavigate();

  const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  return (
    <div className="month-calendar">
      <div className="month-header">
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
          <div className="month-cell header-cell" key={day}>
            {day}
          </div>
        ))}
      </div>

      {weeks.map((week, weekIndex) => (
        <div className="month-row" key={weekIndex}>
          {week.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');

            // 해당 날짜에 해당하는 이벤트 필터
            const dayEvents = events.filter(event => {
              const eventDate = event.date || event.startDate || event.start;
              const eventDay = format(new Date(eventDate), 'yyyy-MM-dd');
              return eventDay === dayStr;
            });

            return (
              <div
                key={dayStr}
                className={`month-cell ${isSunday(day) ? 'sunday' : ''} ${!isSameMonth(day, currentDate) ? 'not-this-month' : ''}`}
              >
                <div className="month-date">{format(day, 'd')}</div>

                {dayEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className={`month-event event-${event.color || 'blue'}`}
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
  );
};

export default MonthCalendar;
