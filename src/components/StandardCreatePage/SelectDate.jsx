import React, { useState, useEffect } from 'react';
import './SelectDate.css';
import DetailTimeModal from './DetailTimeModal';
import RepeatingModal from './RepeatingModal';

const weekDates = [
  { date: '2025-08-11', label: 'Monday 11' },
  { date: '2025-08-12', label: 'Tuesday 12' },
  { date: '2025-08-13', label: 'Wednesday 13' },
  { date: '2025-08-14', label: 'Thursday 14' },
  { date: '2025-08-15', label: 'Friday 15' },
  { date: '2025-08-16', label: 'Saturday 16' },
  { date: '2025-08-17', label: 'Sunday 17' },
];

const SelectDate = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [selectedDate, setSelectedDate] = useState(formData.selectedDate || '');
  const [recommendedDates, setRecommendedDates] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [repeatModalOpen, setRepeatModalOpen] = useState(false);
    const [repeatConfig, setRepeatConfig] = useState(null); // 반복 저장 값

  // ✅ 추천 날짜 API 호출
  useEffect(() => {
    fetch('/api/recommend-dates') // 예시 API
      .then(res => res.json())
      .then(data => setRecommendedDates(data.recommendedDates))
      .catch(err => console.error('추천 날짜 가져오기 실패', err));
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleNext = () => {
    updateFormData({ selectedDate });
    nextStep();
  };

  return (
    <div className="select-date-container">
      <h2>◎ Select Date</h2>

      <div className="calendar-box">
        <div className="calendar-header">August 2025</div>
        <div className="calendar-grid">
          {weekDates.map((day) => (
            <div
              key={day.date}
              className={`calendar-cell ${selectedDate === day.date ? 'selected' : ''}`}
              onClick={() => handleDateClick(day.date)}
            >
              {day.label}
              {recommendedDates.includes(day.date) && (
                <div className="recommended-badge">★</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="recommend-text">
        📅 The most people are available:{" "}
        {recommendedDates.map((d, i) => (
          <span key={d}>
            {d.slice(5)}{i < recommendedDates.length - 1 ? ', ' : ''}
          </span>
        ))}
      </p>

      <button className="repeat-button" onClick={() => setRepeatModalOpen(true)}>🔁 Repeating</button>

    // 모달 렌더링
    {repeatModalOpen && (
    <RepeatingModal
        onClose={() => setRepeatModalOpen(false)}
        onSave={(data) => setRepeatConfig(data)}
    />
    )}
      <div className="bottom-right">
        <button onClick={handleNext}>→</button>
      </div>

      {/* ✅ 팝업 띄우기 */}
      {modalOpen && (
        <DetailTimeModal
          date={selectedDate}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default SelectDate;
