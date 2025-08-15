import React, { useMemo, useEffect, useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import './Week_Calendar.css';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

const hours = Array.from({ length: 24 }, (_, i) => i);

const CATEGORY_COLOR_MAP = {
  PT: 'blue',
  MEETING: 'green',
  STUDY: 'purple',
  DEFAULT: 'blue',
};

const WeekCalendar = ({ currentDate }) => {
  const navigate = useNavigate();

  // 1) 주 시작/끝을 memoize (월요일 시작)
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  // 2) 의존성은 문자열로
  const startStr = useMemo(() => format(weekStart, 'yyyy-MM-dd'), [weekStart]);
  const endStr = useMemo(() => format(weekEnd, 'yyyy-MM-dd'), [weekEnd]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const getHour = (timeStr) => parseInt(String(timeStr || '00:00').split(':')[0], 10) || 0;

  useEffect(() => {
    const controller = new AbortController(); // 3) 요청 취소
    const fetchWeek = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const { data } = await api.get('/api/planlistCalendar/week', {
          params: { startDate: startStr, endDate: endStr },
          signal: controller.signal,
          timeout: 10000, // 4) 옵션: 타임아웃
        });

        const mapped = (Array.isArray(data) ? data : []).flatMap((dayBlock) => {
          const date = dayBlock?.date;
          const list = dayBlock?.planlistCalendar ?? [];
          return list.map((it) => ({
            id: it.sessionId,
            projectId: it.projectId,
            sessionId: it.sessionId,
            title: it.title,
            date,                 // "YYYY-MM-DD"
            startTime: it.start,  // "HH:mm"
            endTime: it.end,      // "HH:mm"
            color: CATEGORY_COLOR_MAP[it.category] || CATEGORY_COLOR_MAP.DEFAULT,
            category: it.category,
          }));
        });

        setEvents(mapped);
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return; // 취소는 무시
        const status = err?.response?.status;
        const body = err?.response?.data;
        setErrorMsg(
          status
            ? `요청 실패 (HTTP ${status}) ${typeof body === 'string' ? body : body?.message || ''}`
            : `네트워크 오류: ${err.message}`
        );
        console.error('Week API error:', {
          url: '/api/planlistCalendar/week',
          params: { startDate: startStr, endDate: endStr },
          status,
          body,
          message: err?.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeek();
    return () => controller.abort(); // 의존성 변경/언마운트 시 취소
  }, [startStr, endStr]); // ✅ 문자열 의존성으로 고정

  return (
    <div className="week-calendar">
      <h2 className="week-calendar-title">{format(currentDate, 'MMMM yyyy')}</h2>

      {loading && <div className="week-calendar-loading">로딩 중…</div>}
      {errorMsg && <div className="week-calendar-error">{errorMsg}</div>}

      <div className="week-calendar-grid">
        <div className="header-row">
          <div className="time-cell" />
          {days.map((day) => (
            <div key={day.toISOString()} className="day-header">
              {format(day, 'EEEE dd')}
            </div>
          ))}
        </div>

        {hours.map((hour) => (
          <div className="row" key={hour}>
            <div className="time-cell">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>

            {days.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayEvents = events.filter((ev) => ev.date === dayStr && getHour(ev.startTime) === hour);

              return (
                <div key={dayStr + hour} className="week-cell">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`event event-${event.color || 'blue'}`}
                      onClick={() => navigate(`/event/${event.id}`)}
                      title={`${event.title} (${event.startTime}–${event.endTime})`}
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
