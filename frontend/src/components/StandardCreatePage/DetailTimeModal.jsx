import React, { useState, useRef, useEffect } from 'react';
import './DetailTimeModal.css';
import { format, parseISO } from 'date-fns';

const DetailTimeModal = ({ date, onClose, onSave }) => {
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const isDragging = useRef(false);
  const startIndex = useRef(null);

  const totalParticipants = 6; // 전체 친구 수 (mock 기준)

  const parsedDate = parseISO(date);
  const dayLabel = format(parsedDate, 'EEE');
  const dayNumber = format(parsedDate, 'd');

  // ✅ mock 데이터로 고정된 가능 인원 수
  useEffect(() => {
    const mockAvailability = {
      3: 6, 4: 6,
      6: 3, 7: 3, 8: 3,
      13: 6,
      15: 5,
      18: 6
    };
    const map = {};
    for (let i = 0; i < 24; i++) {
      map[i] = mockAvailability[i] || 0;
    }
    setAvailabilityMap(map);
  }, []);

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
    const range = getRange(startIndex.current, index);
    setSelectedTimes(range);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (selectedTimes.length > 0) {
      const times = selectedTimes.map(i => `${String(i).padStart(2, '0')}:00`);
      const maxAvailable = Math.max(...selectedTimes.map(i => availabilityMap[i] || 0));
      onSave({ date, time: times, availableCount: maxAvailable });
    }
  };

  const getRange = (start, end) => {
    const [min, max] = [Math.min(start, end), Math.max(start, end)];
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
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
            const availableCount = availabilityMap[i];
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
