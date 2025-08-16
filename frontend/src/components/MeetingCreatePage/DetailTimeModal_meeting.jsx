
import React, { useState, useRef, useEffect, useMemo } from 'react';
import '../StandardCreatePage/DetailTimeModal.css';
import { format, parseISO, isValid as isValidDate } from 'date-fns';

const clampHour = (h) => Math.max(0, Math.min(24, Number.parseInt(h, 10) || 0));
const hourFromHHmm = (hhmm) => clampHour(String(hhmm || '').split(':')[0]);

const DetailTimeModal = ({
  date,
  availableSlots = [],          // ⬅️ NEW: slots for THIS date (from SelectDate)
  totalParticipants = 6,         // optional override
  onClose,
  onSave,
}) => {
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({}); // { 0..23: count }
  const isDragging = useRef(false);
  const startIndex = useRef(null);

  // Build availability per hour from availableSlots
  useEffect(() => {
    // init all 0
    const map = {};
    for (let h = 0; h < 24; h++) map[h] = 0;

    if (Array.isArray(availableSlots) && availableSlots.length > 0) {
      // If ANY allDay → everything full
      const hasAllDay = availableSlots.some(s => s?.allDay === true);
      if (hasAllDay) {
        for (let h = 0; h < 24; h++) map[h] = totalParticipants; // full
      } else {
        // Mark provided ranges as partial (we don't have per-hour counts from API)
        const partialCount = Math.max(1, Math.floor(totalParticipants / 2));
        for (const s of availableSlots) {
          if (!s?.start || !s?.end) continue;
          const sh = hourFromHHmm(s.start);
          const eh = hourFromHHmm(s.end);
          for (let h = sh; h < eh; h++) {
            map[h] = Math.max(map[h], partialCount); // ensure partial shading
          }
        }
      }
    }

    setAvailabilityMap(map);
  }, [availableSlots, totalParticipants]);

  const parsedDate = useMemo(() => {
    const d = parseISO(date);
    return isValidDate(d) ? d : new Date();
  }, [date]);

  const dayLabel = format(parsedDate, 'EEE'); // Mon, Tue...
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
