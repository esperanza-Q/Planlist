import React, { useState, useRef, useEffect } from 'react';
import '../StandardCreatePage/DetailTimeModal.css';
import { format, parseISO } from 'date-fns';
import axios from 'axios';

const DetailTimeModal = ({ date, plannerId, onClose, onSave }) => {
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const isDragging = useRef(false);
  const startIndex = useRef(null);

  const totalParticipants = 6; // 필요시 부모에서 전달받도록 변경 가능

  const parsedDate = parseISO(date);
  const dayLabel = format(parsedDate, 'EEE');
  const dayNumber = format(parsedDate, 'd');

  const formatHourLabel = (h) => {
    if (h === 0 || h === 24) return '12am';
    if (h === 12) return '12pm';
    if (h < 12) return `${h}am`;
    return `${h - 12}pm`;
  };

  const handleMouseDown = (index) => {
    isDragging.current = true;
    startIndex.current = index;
    setSelectedTimes([index]);
  };

  const handleMouseEnter = (index) => {
    if (!isDragging.current || startIndex.current === null) return;
    const [min, max] = [Math.min(startIndex.current, index), Math.max(startIndex.current, index)];
    setSelectedTimes(Array.from({ length: max - min + 1 }, (_, i) => min + i));
  };

  const handleMouseUp = async () => {
    isDragging.current = false;
    if (selectedTimes.length === 0) return;

    const start = `${String(selectedTimes[0]).padStart(2, '0')}:00`;
    const end = `${String(selectedTimes[selectedTimes.length - 1] + 1).padStart(2, '0')}:00`;

    // 선택된 시간 POST 요청
    try {
      const payload = selectedTimes.length === 24
        ? { date, allDay: true }
        : { date, start, end };

      const res = await axios.post('/api/meeting/project/selectTime', payload, {
        params: { plannerId }
      });

      console.log(res.data); // "일정을 선택 완료하였습니다!"
      onSave({ date, time: selectedTimes.map(i => `${String(i).padStart(2, '0')}:00`) });
    } catch (err) {
      console.error('시간 선택 전송 실패:', err);
    }
  };

  return (
    <div className="DetailTime-modal-overlay" onMouseUp={handleMouseUp}>
      <div className="DetailTime-modal-box vertical">
        <div className="DetailTime-modal-header">
          <h3>Detail Time</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="DetailTime-modal-subheader">
          <div className="DetailTime-day-label">{dayLabel}</div>
          <div className="DetailTime-date-label">{dayNumber}</div>
        </div>

        <div className="DetailTime-time-list">
          {Array.from({ length: 24 }, (_, i) => {
            const availableCount = availabilityMap[i] || 0;
            const isFull = availableCount === totalParticipants;
            const isPartial = availableCount > 0 && availableCount < totalParticipants;
            const isSelected = selectedTimes.includes(i);

            return (
              <div
                key={i}
                className={`DetailTime-time-slot 
                  ${isFull ? 'full' : ''} 
                  ${isPartial ? 'partial' : ''} 
                  ${isSelected ? 'selected' : ''}`}
                onMouseDown={() => handleMouseDown(i)}
                onMouseEnter={() => handleMouseEnter(i)}
              >
                <span className="DetailTime-time-label">{formatHourLabel(i)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetailTimeModal;
