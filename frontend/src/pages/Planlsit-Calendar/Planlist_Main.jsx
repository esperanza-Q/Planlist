import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DayCalendar from './Day_Calendar';
import WeekCalendar from './Week_Calendar';
import MonthCalendar from './Month_Calendar';
import Planlist_HeaderBar from '../../components/Planlist_HeaderBar/Planlist_HeaderBar';

import { format } from 'date-fns'; 

const Planlist_MainPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');
  const [events, setEvents] = useState([]);

  /* 실제 API 받아올 때 사용
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/api/events'); // 실제 API 주소로 변경
        setEvents(res.data);
      } catch (err) {
        console.error('이벤트 불러오기 실패:', err);
      }
    };
    fetchEvents();
  }, []);
  */

  //테스트용 데이터
  useEffect(() => {
  const mockEvents = [
    {
      id: 1,
      title: 'React 회의',
      startTime: '09:00',
      endTime: '10:00',
      date: '2025-07-30',
      color: 'blue',
    },
    {
      id: 2,
      title: '디자인 리뷰',
      startTime: '14:00',
      endTime: '15:30',
      date: '2025-07-30',
      color: 'red',
    },
    {
      id: 3,
      title: '코딩 테스트 스터디',
      startTime: '18:00',
      endTime: '19:30',
      date: '2025-07-31',
      color: 'green',
    },
    {
      id: 4,
      title: '팀 회식',
      startTime: '20:00',
      endTime: '22:00',
      date: '2025-08-02',
      color: 'yellow',
    },
  ];

  setEvents(mockEvents);
}, []);


    const renderCalendar = () => {
    const formattedCurrentDate = format(currentDate, 'yyyy-MM-dd');

    const filteredEvents = events.filter(
        (event) => event.date === formattedCurrentDate
    );

    const props = { currentDate, events: filteredEvents };

    switch (viewMode) {
        case 'day':
            return <DayCalendar {...props} />;
        case 'week':
            return <WeekCalendar currentDate={currentDate} events={events} />;
        case 'month':
          return <MonthCalendar currentDate={currentDate} events={events} />;
        default:
            return null;
    }
    };

  return (
    <>
      <Planlist_HeaderBar
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      {renderCalendar()}
       
    </>
  );
};

export default Planlist_MainPage;
