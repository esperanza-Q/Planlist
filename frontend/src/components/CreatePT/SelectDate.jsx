import React, { useState, useEffect } from 'react';
import './SelectDate.css';
import DetailTimeModal from '../StandardCreatePage/DetailTimeModal';
import RepeatingModal from '../StandardCreatePage/RepeatingModal';
import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

import RepeatIcon from '../../icons/RepeatIcon';
import CalendarAltIcon from "../../icons/CalendarAltIcon";
import CalenderCheckIcon from "../../icons/CalenderCheckIcon";

// 테스트용 프로필 이미지 import
import profile1 from '../../assets/ProfilePic.png';
import profile2 from '../../assets/ProfilePic02.svg';
import profile3 from '../../assets/ProfilePic03.svg';
import profile4 from '../../assets/ProfilePic04.svg';
import { ReactComponent as ProfileOverflowIcon } from '../../assets/profile_overflow.svg';

// ======================
// Mock data (safe defaults)
// ======================
const mockFriends = [
  { id: 1, name: 'NAME1', email: 'example1@gmail.com', profileImage: profile1 },
  { id: 2, name: 'NAME2', email: 'example2@gmail.com', profileImage: profile2 },
  { id: 3, name: 'NAME3', email: 'example3@gmail.com', profileImage: profile3 },
  { id: 4, name: 'NAME4', email: 'example4@gmail.com', profileImage: profile4 },
  { id: 5, name: 'NAME5', email: 'example5@gmail.com', profileImage: profile1 },
  { id: 6, name: 'NAME6', email: 'example6@gmail.com', profileImage: profile1 },
];

const mockWeekDates = [
  { date: '2025-08-11', label: 'Monday 11' },
  { date: '2025-08-12', label: 'Tuesday 12' },
  { date: '2025-08-13', label: 'Wednesday 13' },
  { date: '2025-08-14', label: 'Thursday 14' },
  { date: '2025-08-15', label: 'Friday 15' },
  { date: '2025-08-16', label: 'Saturday 16' },
  { date: '2025-08-17', label: 'Sunday 17' },
];

// ======================
// Helpers
// ======================
const formatLabel = (isoDate) => {
  const dt = new Date(`${isoDate}T00:00:00`);
  const weekday = dt.toLocaleDateString(undefined, { weekday: 'long' });
  const dayNum = dt.getDate();
  return `${weekday} ${dayNum}`;
};

const coerceWeekDates = (data) => {
  // 1) Already in expected shape: { weekDates: [{date,label}, ...] }
  if (Array.isArray(data?.weekDates)) return data.weekDates;

  // 2) From freeTimeCalendar: { freeTimeCalendar: [{date:"YYYY-MM-DD", start:"HH:mm", end:"HH:mm"}, ...] }
  if (Array.isArray(data?.freeTimeCalendar)) {
    const uniqueDates = Array.from(
      new Set(data.freeTimeCalendar.map(x => x?.date).filter(Boolean))
    ).sort();
    return uniqueDates.map(d => ({ date: d, label: formatLabel(d) }));
  }

  // 3) Unknown shape -> use mocks
  return mockWeekDates;
};

const formatAmPm = (time) => {
  if (!time) return '';
  const [hourStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  if (Number.isNaN(hour)) return time;
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
};

// ======================
// Component
// ======================
const SelectDate = ({
  formData = {},
  updateFormData = () => {},
  nextStep = () => {},
  prevStep = () => {},
}) => {
  const [selectedDate, setSelectedDate] = useState(formData.selectedDate || '');

  const [recommendedDates, setRecommendedDates] = useState([]); // ['2025-08-12', '2025-08-14']
  const [availableMap, setAvailableMap] = useState({}); // { 'YYYY-MM-DD': numberAvailable, ... }

  const [modalOpen, setModalOpen] = useState(false);
  const [repeatModalOpen, setRepeatModalOpen] = useState(false);
  const [repeatConfig, setRepeatConfig] = useState(null);

  const [chosenTimes, setChosenTimes] = useState({}); // { 'YYYY-MM-DD': ['14:00','15:00'], ... }
  const [selectedTimeInfo, setSelectedTimeInfo] = useState(null); // { date, time: [...] }

  // Initialize with safe mock to avoid undefined.map
  const [weekDates, setWeekDates] = useState(mockWeekDates);

  // ✅ 추천 날짜 & 가능한 인원 수 mock (or replace with API call)
  useEffect(() => {
    const mockRecommended = ['2025-08-12', '2025-08-14'];
    const mockAvail = {
      '2025-08-11': 2,
      '2025-08-12': 6,
      '2025-08-13': 0,
      '2025-08-14': 6,
      '2025-08-15': 1,
      '2025-08-16': 3,
      '2025-08-17': 0,
    };
    setRecommendedDates(mockRecommended);
    setAvailableMap(mockAvail);
  }, []);

  // 주간 날짜 로드 (실패 시 mock 사용)
  useEffect(() => {
    const fetchWeekDates = async () => {
      try {
        const res = await fetch('/api/week-dates');
        const data = await res.json();
        const dates = coerceWeekDates(data);
        setWeekDates(Array.isArray(dates) ? dates : mockWeekDates);
      } catch (error) {
        console.error('주간 날짜 정보 가져오기 실패:', error);
        setWeekDates(mockWeekDates);
      }
    };

    fetchWeekDates();
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleNext = () => {
    updateFormData({ selectedDate, chosenTimes, repeatConfig });
    nextStep();
  };

  return (
    <div className="select-date-container">
      {/* 헤더 */}
      <div className="select-date-header">
        <div className="select-date-title-header">
          <button onClick={prevStep} className="prev-button"><BackIcon /></button>
          <h2>Select Date</h2>
        </div>
        <div className="selcet-friends-profile">
          {mockFriends.slice(0, 3).map((friend) => (
            <img
              key={friend.id}
              src={friend.profileImage}
              alt={friend.name}
              className="selcet-profile-img"
            />
          ))}
          {mockFriends.length > 4 && (
            <ProfileOverflowIcon className="profile-skip-icon" />
          )}
        </div>
      </div>

      {/* 달력 */}
      <div className="selcet-calendar-box">
        <div className="selcet-calendar-header">August 2025</div>
        <div className="selcet-calendar-grid">
          {(weekDates || []).map((day) => {
            const availableCount = (availableMap && availableMap[day.date]) || 0;
            const isFull = availableCount === mockFriends.length;
            const isPartial = availableCount > 0 && availableCount < mockFriends.length;

            return (
              <div
                key={day.date}
                className="selcet-calendar-cell"
                onClick={() => handleDateClick(day.date)}
              >
                <div className="selcet-cell-label">{day.label}</div>
                <div
                  className={`
                    selcet-cell-box 
                    ${selectedDate === day.date ? 'selected' : ''}
                    ${isFull ? 'full-available' : ''}
                    ${isPartial ? 'partial-available' : ''}
                  `}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="Select_second_title">
        {/* 추천 날짜 표시 */}
        <p className="selcet-recommend-text">
          <CalendarAltIcon className="select-calendar-icon" /> The most people are available:{' '}
          {(recommendedDates || []).map((d, i) => (
            <span key={d}>
              {d.slice(5)}
              {i < (recommendedDates?.length || 0) - 1 ? ', ' : ''}
            </span>
          ))}
        </p>

        {/* 반복 모달 버튼 */}
        <button className="repeat-button" onClick={() => setRepeatModalOpen(true)}>
          <RepeatIcon /> Repeating
        </button>
      </div>

      {/* 반복 모달 */}
      {repeatModalOpen && (
        <RepeatingModal
          onClose={() => setRepeatModalOpen(false)}
          onSave={(data) => setRepeatConfig(data)}
        />
      )}

      <p className="selected-info-text">
        <CalenderCheckIcon className="select-calendar-icon" /> Selected:{' '}
        {selectedTimeInfo && Array.isArray(selectedTimeInfo.time) && selectedTimeInfo.time.length > 0 ? (
          <>
            {selectedTimeInfo.date},{' '}
            {formatAmPm(selectedTimeInfo.time[0])} ~{' '}
            {formatAmPm(selectedTimeInfo.time[selectedTimeInfo.time.length - 1])}
          </>
        ) : (
          'Please select a time.'
        )}
      </p>

      {/* 다음 단계 버튼 */}
      <button className="project2-next-button" onClick={handleNext}>
        <ProjectNextIcon />
      </button>

      {/* 시간 선택 모달 */}
      {modalOpen && (
        <DetailTimeModal
          date={selectedDate}
          onClose={() => setModalOpen(false)}
          onSave={({ date, time /*, availableCount */ }) => {
            setChosenTimes((prev) => ({ ...prev, [date]: time }));
            setSelectedTimeInfo({ date, time });
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default SelectDate;
