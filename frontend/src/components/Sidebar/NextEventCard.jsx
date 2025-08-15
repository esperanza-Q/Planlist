import React, { useEffect, useState } from 'react';
import './NextEventCard.css';
import google_meet_logo from '../../assets/google_meet_logo.svg';
import bell from '../../assets/bell.svg';
import { api } from '../../api/client'; // axios 인스턴스

const NextEventCard = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchNextEvent = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/sidebar');
        console.log('Sidebar API response:', response);
        console.log('Sidebar data:', response.data);

        const data = response.data; // 실제 데이터
        console.log('Fetched data:', data);

        if (!cancelled) {
          // 서버 데이터가 배열이면 첫 번째 요소 사용, 객체면 그대로
          const nextEvent = Array.isArray(data)
            ? data[0] || null
            : data && Object.keys(data).length > 0
            ? data
            : null;
          setEvent(nextEvent);
        }
      } catch (err) {
        console.error('Failed to fetch event:', err);
        if (!cancelled) setEvent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNextEvent();
    return () => {
      cancelled = true;
    };
  }, []);

  // 시간 포맷 변환 (17:00:00 → { time: '5:00', ampm: 'PM' })
  const formatTime = (timeStr) => {
    if (!timeStr) return { time: '--:--', ampm: '' };
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;
    return { time: `${hour}:${m}`, ampm };
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="event-card">
        <div className="event-header">
          <img src={bell} alt="bell-icon" className="bell-icon" />
          <div className="event-title">
            <p className="event-label">Next Event</p>
            <p className="event-name">
              <span className="event-dot" /> Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 이벤트 없을 때 표시
  if (!event) {
    return (
      <div className="event-card">
        <div className="event-header">
          <img src={bell} alt="bell-icon" className="bell-icon" />
          <div className="event-title">
            <p className="event-label">Next Event</p>
            <p className="event-name">
              <span className="event-dot" /> No events to import
            </p>
          </div>
        </div>
      </div>
    );
  }

  const start = formatTime(event.startTime);
  const end = formatTime(event.endTime);

  return (
    <div className="event-card">
      <div className="event-header">
        <img src={bell} alt="bell-icon" className="bell-icon" />
        <div className="event-title">
          <p className="event-label">Today's Next Event</p>
          <p className="event-name">
            <span className="event-dot" /> {event.title || 'Untitled Event'}
          </p>
        </div>
      </div>

      <hr className="divider" />

      <div className="event-time">
        <div className="time-block">
          <p className="time">{start.time}</p>
          <p className="ampm">{start.ampm}</p>
        </div>
        <div className="time-arrow">⇄</div>
        <div className="time-block">
          <p className="time">{end.time}</p>
          <p className="ampm">{end.ampm}</p>
        </div>
      </div>
    </div>
  );
};

export default NextEventCard;
