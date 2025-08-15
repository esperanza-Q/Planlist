// src/components/CreatePT/SelectDate.jsx
import React, { useState, useEffect, useMemo } from 'react';
import './SelectDate.css';
import DetailTimeModal from '../StandardCreatePage/DetailTimeModal';
import RepeatingModal from '../StandardCreatePage/RepeatingModal';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

import RepeatIcon from '../../icons/RepeatIcon';
import CalendarAltIcon from "../../icons/CalendarAltIcon";
import CalenderCheckIcon from "../../icons/CalenderCheckIcon";
import { api } from '../../api/client';

// (kept) mock friends just for avatars/thresholds if needed elsewhere
import profile1 from '../../assets/ProfilePic.png';
import profile2 from '../../assets/ProfilePic02.svg';
import profile3 from '../../assets/ProfilePic03.svg';
import profile4 from '../../assets/ProfilePic04.svg';

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

const formatLabel = (isoDate) => {
  const dt = new Date(`${isoDate}T00:00:00`);
  const weekday = dt.toLocaleDateString(undefined, { weekday: 'long' });
  const dayNum = dt.getDate();
  return `${weekday} ${dayNum}`;
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

const parseSharePlanner = (data) => {
  const all = Array.isArray(data?.ALL) ? data.ALL : [];

  // Build unique dates & labels
  const uniqueDates = Array.from(new Set(all.map(x => x?.date).filter(Boolean))).sort();
  const weekDates = (uniqueDates.length
    ? uniqueDates.map(d => ({ date: d, label: formatLabel(d) }))
    : mockWeekDates
  );

  // Availability: count entries per date (allDay counts heavier)
  const availableMap = {};
  for (const slot of all) {
    const d = slot?.date;
    if (!d) continue;
    const val = slot?.allDay ? 24 : 1;
    availableMap[d] = (availableMap[d] || 0) + val;
  }

  // Recommended = top 2 by availability
  const recommendedDates = [...uniqueDates]
    .sort((a, b) => (availableMap[b] || 0) - (availableMap[a] || 0))
    .slice(0, 2);

  return {
    weekLabel: typeof data?.week === 'string' && data.week.trim() ? data.week : 'Week',
    weekDates,
    availableMap,
    recommendedDates,
  };
};

const SelectDate = ({
  formData = {},
  updateFormData = () => {},
  nextStep = () => {},
  prevStep = () => {},
}) => {
  const [selectedDate, setSelectedDate] = useState(formData.selectedDate || '');
  const [recommendedDates, setRecommendedDates] = useState([]);
  const [availableMap, setAvailableMap] = useState({});
  const [weekDates, setWeekDates] = useState(mockWeekDates);
  const [weekHeader, setWeekHeader] = useState('Week');

  const [modalOpen, setModalOpen] = useState(false);
  const [repeatModalOpen, setRepeatModalOpen] = useState(false);
  const [repeatConfig, setRepeatConfig] = useState(null);

  const [chosenTimes, setChosenTimes] = useState({});
  const [selectedTimeInfo, setSelectedTimeInfo] = useState(null);

  // 🔌 Fetch from /api/pt/project/sharePlanner?plannerId=...
  useEffect(() => {
    const plannerId =
      formData?.plannerId ??
      formData?.session?.plannerId ??
      formData?.session?.id ??
      null;

    const load = async () => {
      if (!plannerId) return; // no planner yet → keep mocks
      try {
        const res = await api.getSession(
          `/api/pt/project/sharePlanner?${plannerId}`
        );
        const parsed = parseSharePlanner(res);
        setWeekDates(parsed.weekDates);
        setAvailableMap(parsed.availableMap);
        setRecommendedDates(parsed.recommendedDates);
        setWeekHeader(parsed.weekLabel);
      } catch (e) {
        console.error('Failed to load sharePlanner:', e);
        // graceful fallback
        setWeekDates(mockWeekDates);
        setAvailableMap({});
        setRecommendedDates([]);
        setWeekHeader('Week');
      }
    };

    load();
  }, [formData?.plannerId, formData?.session?.plannerId, formData?.session?.id]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleNext = () => {
    updateFormData({ selectedDate, chosenTimes, repeatConfig });
    nextStep();
  };

  // For coloring cells: use relative max availability of this week
  const maxAvail = useMemo(
    () => Math.max(0, ...Object.values(availableMap || {})),
    [availableMap]
  );

  return (
    <div className="select-date-container">
      {/* Header */}
      <div className="select-date-header">
        <div className="select-date-title-header">
          <h2>Select Date</h2>
        </div>
      </div>

      {/* Calendar */}
      <div className="selcet-calendar-box">
        <div className="selcet-calendar-header">{weekHeader}</div>
        <div className="selcet-calendar-grid">
          {(weekDates || []).map((day) => {
            const availableCount = (availableMap && availableMap[day.date]) || 0;
            const isFull = maxAvail > 0 && availableCount === maxAvail;
            const isPartial = availableCount > 0 && availableCount < maxAvail;

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
        {/* Recommended */}
        <p className="selcet-recommend-text">
          <CalendarAltIcon className="select-calendar-icon" /> The most people are available:{' '}
          {(recommendedDates || []).map((d, i) => (
            <span key={d}>
              {d.slice(5)}
              {i < (recommendedDates?.length || 0) - 1 ? ', ' : ''}
            </span>
          ))}
        </p>

        {/* Repeating */}
        <button className="repeat-button" onClick={() => setRepeatModalOpen(true)}>
          <RepeatIcon /> Repeating
        </button>
      </div>

      {/* Repeating modal */}
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

      {/* Next */}
      <button className="project2-next-button" onClick={handleNext}>
        <ProjectNextIcon />
      </button>

      {/* Time modal */}
      {modalOpen && (
        <DetailTimeModal
          date={selectedDate}
          onClose={() => setModalOpen(false)}
          onSave={({ date, time }) => {
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
  