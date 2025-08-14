// SelectDate_meeting.jsx
import React, { useState, useEffect } from 'react';
import '../StandardCreatePage/SelectDate.css';
import DetailTimeModal from './DetailTimeModal_meeting';
import RepeatingModal from './RepeatingModal_meeting';
import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import RepeatIcon from '../../icons/RepeatIcon';
import CalendarAltIcon from "../../icons/CalendarAltIcon";
import CalenderCheckIcon from "../../icons/CalenderCheckIcon";
import {ReactComponent as ProfileOverflowIcon } from '../../assets/profile_overflow.svg';
import axios from 'axios';

const SelectDate = ({ formData, updateFormData, nextStep, prevStep, createProject }) => {
  const [plannerId, setPlannerId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(formData.selectedDate || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [repeatModalOpen, setRepeatModalOpen] = useState(false);
  const [repeatConfig, setRepeatConfig] = useState(null);
  const [chosenTimes, setChosenTimes] = useState({});
  const [selectedTimeInfo, setSelectedTimeInfo] = useState(null);
  const [weekDates, setWeekDates] = useState([]);
  const [friends, setFriends] = useState([]);
  const [availableMap, setAvailableMap] = useState({});

  // 시간 표시 포맷
  const formatAmPm = (time) => {
    const [hourStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    if (hour < 12) return `${hour}am`;
    return `${hour - 12}pm`;
  };

  // 1️⃣ 프로젝트 생성
  useEffect(() => {
    const create = async () => {
      try {
        const res = await createProject();
        console.log('Create project response: ', res);
        setPlannerId(res.projectId);
      } catch (err) {
        console.error('프로젝트 생성 실패', err);
      }
    };
    if (!plannerId) create();
  }, [plannerId, createProject]);

  // 2️⃣ 주간 날짜 가져오기
  useEffect(() => {
    const fetchWeekDates = async () => {
      try {
        const res = await axios.get('/api/week-dates'); // 필요시 백엔드 구현
        setWeekDates(res.data.weekDates || []);
      } catch (err) {
        console.error('주간 날짜 정보 가져오기 실패:', err);
        setWeekDates([]); // fallback
      }
    };
    fetchWeekDates();
  }, []);

  // 3️⃣ 친구 목록 및 날짜별 가용 인원 가져오기
  useEffect(() => {
    if (!plannerId) return;

    const fetchPlannerData = async () => {
      try {
        const res = await axios.get('/api/project/sharePlanner', {
          params: { plannerId }
        });
        const { ALL, friends: friendList, totalParticipants } = res.data;

        // 날짜별 가용 인원
        const dateMap = {};
        ALL.forEach(slot => {
          dateMap[slot.date] = slot.allDay
            ? totalParticipants
            : totalParticipants; // 필요시 시간별 처리 DetailTimeModal에서
        });
        setAvailableMap(dateMap);
        setFriends(friendList || []);
      } catch (err) {
        console.error('공유 플래너 가져오기 실패:', err);
        setAvailableMap({});
        setFriends([]);
      }
    };
    fetchPlannerData();
  }, [plannerId]);

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
          {friends.slice(0, 3).map((friend) => (
            <img key={friend.id} src={friend.profileImage} alt={friend.name} className="selcet-profile-img" />
          ))}
          {friends.length > 4 && <ProfileOverflowIcon className="profile-skip-icon" />}
        </div>
      </div>

      {/* 달력 */}
      <div className="selcet-calendar-box">
        <div className="selcet-calendar-header">August 2025</div>
        <div className="selcet-calendar-grid">
          {weekDates.map((day) => {
            const availableCount = availableMap[day.date] || 0;
            const isFull = availableCount === friends.length;
            const isPartial = availableCount > 0 && availableCount < friends.length;

            return (
              <div key={day.date} className="selcet-calendar-cell" onClick={() => handleDateClick(day.date)}>
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

      {/* 추천 날짜 & 반복 버튼 */}
      <div className="Select_second_title">
        <button className="repeat-button" onClick={() => setRepeatModalOpen(true)}>
          <RepeatIcon /> Repeating
        </button>
      </div>

      {/* 선택 정보 */}
      <p className="selected-info-text">
        <CalenderCheckIcon className="select-calendar-icon" /> Selected:{" "}
        {selectedTimeInfo?.time?.length > 0 ? (
          <>
            {selectedTimeInfo.date}, {formatAmPm(selectedTimeInfo.time[0])} ~ {formatAmPm(selectedTimeInfo.time[selectedTimeInfo.time.length - 1])}
          </>
        ) : (
          "Please select a time."
        )}
      </p>

      {/* 다음 단계 버튼 */}
      <button className="project2-next-button" onClick={handleNext}><ProjectNextIcon /></button>

      {/* 모달 */}
      {modalOpen && plannerId && (
        <DetailTimeModal
          date={selectedDate}
          plannerId={plannerId}
          totalParticipants={friends.length}
          onClose={() => setModalOpen(false)}
          onSave={async ({ date, start, end, allDay }) => {
            try {
              await axios.post('/api/meeting/project/selectTime', { plannerId, date, start, end, allDay });
              setChosenTimes(prev => ({ ...prev, [date]: allDay ? ['allDay'] : [start, end] }));
              setSelectedTimeInfo({ date, time: allDay ? ['allDay'] : [start, end] });
              setModalOpen(false);
            } catch (err) {
              console.error('시간 선택 실패:', err);
            }
          }}
        />
      )}

      {repeatModalOpen && (
        <RepeatingModal
          onClose={() => setRepeatModalOpen(false)}
          onSave={(data) => setRepeatConfig(data)}
        />
      )}
    </div>
  );
};

export default SelectDate;
