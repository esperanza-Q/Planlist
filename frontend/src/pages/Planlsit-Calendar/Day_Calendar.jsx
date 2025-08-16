import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import './Day_Calendar.css';
import { format as fmt } from 'date-fns';

const CATEGORY_COLOR_MAP = {
  PT: 'blue',
  MEETING: 'green',
  STUDY: 'purple',
  DEFAULT: 'blue',
};

const DayCalendar = ({ currentDate }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 반드시 yyyy-MM-dd (ISO) 로 보내야 함
  const ymd = useMemo(() => fmt(currentDate, 'yyyy-MM-dd'), [currentDate]);

  const parseTime = (timeStr) => {
    const [h, m] = String(timeStr || '00:00').split(':').map(Number);
    return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
  };

  useEffect(() => {
    const fetchDay = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const currentDate = new Date('2025-08-10'); // API에 있는 날짜

        const { data } = await api.get('/api/planlistCalendar/day', { params: { date: ymd } });

        const dayItem = Array.isArray(data) && data.length > 0 ? data[0] : null;


          console.log('Selected dayItem:', dayItem);
        const list = dayItem?.planlistCalendar ?? [];

        const mapped = list.map((it) => ({
          id: it.sessionId,
          projectId: it.projectId,
          sessionId: it.sessionId,
          title: it.title,
          startTime: it.start,
          endTime: it.end,
          color: CATEGORY_COLOR_MAP[it.category] || CATEGORY_COLOR_MAP.DEFAULT,
          category: it.category,
        }));

        setEvents(mapped);
      } catch (err) {
        const status = err?.response?.status;
        const body = err?.response?.data;
        setErrorMsg(
          status
            ? `요청 실패 (HTTP ${status}) ${typeof body === 'string' ? body : body?.message || ''}`
            : `네트워크 오류: ${err.message}`
        );
        console.error('Day API error:', {
          url: '/api/planlistCalendar/day',
          params: { date: ymd },
          status,
          body,
          message: err?.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDay();
  }, [ymd]);

  return (
    <div className="day-calendar-container">
      <div className="day-calendar-header">
        <span className="day-calendar-date">{fmt(currentDate, 'EEEE dd')}</span>
        {loading && <span className="day-calendar-loading">로딩 중…</span>}
        {errorMsg && <span className="day-calendar-error">{errorMsg}</span>}
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
              const height = Math.max(10, ((end - start) / 60) * 60);

              return (
                <div
                  key={event.id}
                  className={`day-event-block event event-${event.color || 'blue'}`}
                  style={{ top: `${top}px`, height: `${height}px` }}
                  onClick={() => navigate(`/event/${event.id}`)}
                  title={`${event.title} (${event.startTime}–${event.endTime})`}
                >
                  <div className="day-event-title">• {event.title}</div>
                  <div className="day-event-time">
                    {event.startTime} → {event.endTime}
                  </div>
                </div>
              );
            })}

            {!loading && !errorMsg && events.length === 0 && (
              <div className="day-empty-hint">이 날짜에는 일정이 없어요.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayCalendar;
