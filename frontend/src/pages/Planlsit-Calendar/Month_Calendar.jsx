// src/components/Calendar/Month_Calendar.jsx
import React, { useMemo, useEffect, useState } from 'react';
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
import { api } from '../../api/client';

const CATEGORY_COLOR_MAP = {
  PT: 'red',
  MEETING: 'green',
  Travel: 'purple',
  DEFAULT: 'blue',
};

const MonthCalendar = ({ currentDate }) => {
  const navigate = useNavigate();

  // ✅ 카테고리별 라우팅 헬퍼 (Day/Week와 동일 규칙)
  const routeForEvent = (event) => {
    const id = encodeURIComponent(event.projectId);
    const cat = String(event.category || '').trim().toLowerCase();

    switch (cat) {
      case 'pt':
        return `/project/pt?projectId=${id}`;
      case 'meeting':
        return `/project/meeting?projectId=${id}`;
      case 'travel':
        return `/project/travel?projectId=${id}`;
      case 'standard':
        return `/project/standard?projectId=${id}`;
      default:
        return `/project?projectId=${id}`;
    }
  };

  // 월력 범위(월요일 시작)
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd   = useMemo(() => endOfMonth(currentDate),  [currentDate]);
  const start      = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 1 }), [monthStart]);
  const end        = useMemo(() => endOfWeek(monthEnd,   { weekStartsOn: 1 }), [monthEnd]);

  const days = useMemo(() => eachDayOfInterval({ start, end }), [start, end]);
  const weeks = useMemo(() => {
    const out = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [days]);

  // API 상태
  const [eventsByDate, setEventsByDate] = useState(new Map()); // key: 'YYYY-MM-DD' -> Array<event>
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // mon 파라미터 (yyyy-MM)
  const monStr = useMemo(() => format(currentDate, 'yyyy-MM'), [currentDate]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMonth = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.get('/api/planlistCalendar/month', {
          params: { mon: monStr },
          signal: controller.signal,
          timeout: 10000,
        });

        const payload = res?.data ?? res; // 인터셉터 유무 모두 대응
        // payload: Array<{ date: 'YYYY-MM-DD', planlistCalendar: Array<...> }>
        const map = new Map();

        (Array.isArray(payload) ? payload : []).forEach((dayBlock) => {
          const date = dayBlock?.date;
          const list = dayBlock?.planlistCalendar ?? [];
          const mapped = list.map((it) => ({
            id: it.sessionId,
            projectId: it.projectId,
            sessionId: it.sessionId,
            title: it.title,
            date,                 // 'YYYY-MM-DD'
            startTime: it.start,  // 'HH:mm'
            endTime: it.end,      // 'HH:mm'
            color: CATEGORY_COLOR_MAP[it.category] || CATEGORY_COLOR_MAP.DEFAULT,
            category: it.category,
          }));
          map.set(date, mapped);
        });

        setEventsByDate(map);
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        const status = err?.response?.status;
        const body = err?.response?.data;
        setErrorMsg(
          status
            ? `요청 실패 (HTTP ${status}) ${typeof body === 'string' ? body : body?.message || ''}`
            : `네트워크 오류: ${err.message}`
        );
        console.error('Month API error:', {
          url: '/api/planlistCalendar/month',
          params: { mon: monStr },
          status,
          body,
          message: err?.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMonth();
    return () => controller.abort();
  }, [monStr]);

  return (
    <div className="month-calendar">
      <h2 className="week-calendar-title">{format(currentDate, 'MMMM yyyy')}</h2>

      {loading && <div className="month-calendar-loading">로딩 중…</div>}
      {errorMsg && <div className="month-calendar-error">{errorMsg}</div>}

      <div className="month-header">
        {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day) => (
          <div className="month-cell header-cell" key={day}>{day}</div>
        ))}
      </div>

      {weeks.map((week, weekIndex) => (
        <div className="month-row" key={weekIndex}>
          {week.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate.get(dayStr) ?? [];

            return (
              <div
                key={dayStr}
                className={`month-cell ${isSunday(day) ? 'sunday' : ''} ${!isSameMonth(day, currentDate) ? 'not-this-month' : ''}`}
              >
                <div className="month-date">{format(day, 'd')}</div>

                {dayEvents.map((event) => (
                  <div
                    key={`${event.id}-${event.startTime}-${event.endTime}`}
                    className={`month-event event-${event.color || 'blue'}`}
                    // ✅ 카테고리별 라우팅으로 변경
                    onClick={() => navigate(routeForEvent(event))}
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
  );
};

export default MonthCalendar;
