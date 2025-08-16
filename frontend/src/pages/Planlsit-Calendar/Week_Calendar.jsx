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
  const controller = new AbortController();
  const fetchWeek = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/api/planlistCalendar/week', {
        params: { startDate: startStr, endDate: endStr },
        signal: controller.signal,
        timeout: 10000,
      });

      // 인터셉터 유무 모두 대응
      const payload = res?.data ?? res;
      console.log('Week API payload:', payload);

      // ---- 다양한 응답 구조를 모두 커버 ----
      // 1) [{ date, planlistCalendar: [...] }, ...] 형태
      let dayBlocks = Array.isArray(payload) ? payload : null;

      // 2) { all: [{ date, planlistCalendar: [...] }, ...], week: '...' } 형태
      if (!dayBlocks && Array.isArray(payload?.all)) {
        dayBlocks = payload.all;
      }

      // 3) { date, planlistCalendar: [...] } 단일 객체
      if (!dayBlocks && payload && typeof payload === 'object' && payload?.date) {
        dayBlocks = [payload];
      }

      // 4) { planlistCalendar: [...] }만 있는 형태
      if (!dayBlocks && Array.isArray(payload?.planlistCalendar)) {
        dayBlocks = [{ date: startStr, planlistCalendar: payload.planlistCalendar }];
      }

      // 최종 안전 가드
      dayBlocks = Array.isArray(dayBlocks) ? dayBlocks : [];

      // 주간 범위(weekStart~weekEnd)에 해당하는 날짜만 필터(서버가 더 넓게 줄 수 있으므로)
      const allowed = new Set(
        Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'))
      );
      const filteredBlocks = dayBlocks.filter(b => b?.date && allowed.has(b.date));

      // 평탄화   표준 이벤트 형태로 매핑
      const mapped = filteredBlocks.flatMap(dayBlock => {
        const date = dayBlock?.date; // "YYYY-MM-DD"
        const list = Array.isArray(dayBlock?.planlistCalendar) ? dayBlock.planlistCalendar : [];

        return list.map(it => ({
          id: it.sessionId,
          projectId: it.projectId,
          sessionId: it.sessionId,
          title: it.title,
          date,                 // "YYYY-MM-DD"
          startTime: it.start,  // "HH:mm" or "HH:mm:ss"도 허용(아래 getHour에서 분리 처리)
          endTime: it.end,
          color: CATEGORY_COLOR_MAP[it.category] || CATEGORY_COLOR_MAP.DEFAULT,
          category: it.category,
        }));
      });

      setEvents(mapped);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
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
  return () => controller.abort();
}, [startStr, endStr, weekStart]); // weekStart도 의존성에 포함 권장

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

        <div className="body-row">
    {/* 좌측 시간 컬럼 (배경 눈금) */}
    <div className="time-column">
      {hours.map((hour) => (
        <div className="time-slot" key={hour}>
          {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
        </div>
      ))}
    </div>
 
    {/* 요일별 컬럼 */}
    {days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayEvents = events.filter((ev) => ev.date === dayStr);
 
      // 분 단위 파싱 & 블록 위치 계산
      const toMin = (t) => {
        const [h, m] = String(t || '00:00').split(':').map(Number);
        return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
      };
      const HOUR_PX = 60; // 한 시간 높이(px) — CSS 변수로 빼도 됨
      const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
 
      return (
        <div key={dayStr} className="week-day-column">
          {/* 배경 그리드(24시간 눈금) */}
          <div className="week-day-grid">
            {hours.map((h) => <div key={h} className="grid-hour" />)}
          </div>
 
          {/* 이벤트 블록(절대 배치) */}
          {dayEvents.map((ev) => {
            const s = clamp(toMin(ev.startTime), 0, 24 * 60);
            const e = clamp(toMin(ev.endTime || ev.startTime), 0, 24 * 60);
            const top = (s / 60) * HOUR_PX;
            const height = Math.max(14, ((e - s) / 60) * HOUR_PX); // 최소 높이 14px
            return (
              <div
                key={ev.id}
                className={`week-event-block event event-${ev.color || 'blue'}`}
                style={{ top: `${top}px`, height: `${height}px` }}
                onClick={() => navigate(`/event/${ev.id}`)}
                title={`${ev.title} (${ev.startTime}–${ev.endTime})`}
              >
                <div className="event-title">• {ev.title}</div>
                <div className="event-time">{ev.startTime} → {ev.endTime}</div>
              </div>
            );
          })}
        </div>
      );
    })}
  </div>
      </div>
    </div>
  );
};

export default WeekCalendar;
