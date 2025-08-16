// src/components/CreatePT/SelectDate.jsx
import React, { useState, useEffect } from 'react';
import './SelectDate.css';
import DetailTimeModal from '../StandardCreatePage/DetailTimeModalLinked';
import RepeatingModal from '../StandardCreatePage/RepeatingModal';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

import RepeatIcon from '../../icons/RepeatIcon';
import CalendarAltIcon from "../../icons/CalendarAltIcon";
import CalenderCheckIcon from "../../icons/CalenderCheckIcon";
import { api } from '../../api/client';

import { useNavigate } from 'react-router-dom';

// ---------- helpers ----------
const pad2 = (n) => String(n).padStart(2, '0');
const toISODate = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

// + PATCH: 
const plusOneHour = (hhmm) => {
  const [hStr, mStr = '00'] = String(hhmm).split(':');
  const d = new Date(2000, 0, 1, parseInt(hStr || 0, 10), parseInt(mStr || 0, 10));
  d.setHours(d.getHours() + 1);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};


const formatLabel = (isoDate) => {
  const dt = new Date(`${isoDate}T00:00:00`);
  const weekday = dt.toLocaleDateString('en-US', { weekday: 'long' }); // English
  const dayNum = dt.getDate();
  return `${weekday} ${dayNum}`;
};

// Parse server payload -> full week + availability + slotsByDate
// If any slot on a date has allDay=true -> full-available
// Else if date exists -> partial-available
const parseSharePlanner = (data) => {
  const slots = Array.isArray(data?.ALL)
    ? data.ALL
    : (Array.isArray(data?.all) ? data.all : []);

  // Build availability info and slotsByDate
  // perDate[iso] = { hasAny: true, full: true|false }
  const perDate = {};
  const slotsByDate = {};
  for (const s of slots) {
    const d = s?.date;
    if (!d) continue;

    if (!perDate[d]) perDate[d] = { hasAny: false, full: false };
    perDate[d].hasAny = true;
    if (s?.allDay) perDate[d].full = true;

    if (!slotsByDate[d]) slotsByDate[d] = [];
    slotsByDate[d].push({
      start: s?.start ?? null,
      end: s?.end ?? null,
      allDay: !!s?.allDay,
    });
  }

  // Derive week start (Monday) from `week`: "YYYY-MM-DD ~ YYYY-MM-DD"
  let weekStartISO = null;
  if (typeof data?.week === 'string' && data.week.includes('~')) {
    weekStartISO = data.week.split('~')[0].trim();
  } else {
    // fallback: current week Monday
    const now = new Date();
    const dow = now.getDay();
    const monday = addDays(now, dow === 0 ? -6 : (1 - dow));
    weekStartISO = toISODate(monday);
  }

  const start = new Date(`${weekStartISO}T00:00:00`);

  // Always render Mon..Sun => 7 days
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    const iso = toISODate(d);
    const label = formatLabel(iso);
    const info = perDate[iso] || { hasAny: false, full: false };
    return { date: iso, label, info };
  });

  // Header: "Month YYYY" from the start of week (English)
  const weekHeader = start.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return { weekHeader, weekDates, slotsByDate };
};
// --------------------------------

const SelectDate = ({
  formData = {},
  updateFormData = () => {},
  nextStep = () => {},
  prevStep = () => {},
}) => {
  
  const getProjectId = (fd) =>
    fd?.projectId ?? fd?.project?.id ?? fd?.project?.projectId ?? null;
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(formData.selectedDate || '');
  const [weekDates, setWeekDates] = useState([]);
  const [weekHeader, setWeekHeader] = useState(' ');

  const [modalOpen, setModalOpen] = useState(false);
  const [repeatModalOpen, setRepeatModalOpen] = useState(false);
  const [repeatConfig, setRepeatConfig] = useState(null);

  const [chosenTimes, setChosenTimes] = useState({});
  const [selectedTimeInfo, setSelectedTimeInfo] = useState(null);

  const [slotsByDate, setSlotsByDate] = useState({});

  // 🔌 Load schedule using plannerId saved in previous step
  useEffect(() => {
    const plannerId =
      formData?.plannerId ??
      formData?.session?.plannerId ??
      formData?.session?.id ??
      null;

    const load = async () => {
      try {
        if (!plannerId) {
          // fallback: current week scaffold
          const now = new Date();
          const dow = now.getDay();
          const monday = addDays(now, dow === 0 ? -6 : (1 - dow));
          const startISO = toISODate(monday);
          const start = new Date(`${startISO}T00:00:00`);
          const wd = Array.from({ length: 7 }, (_, i) => {
            const d = addDays(start, i);
            const iso = toISODate(d);
            return { date: iso, label: formatLabel(iso), info: { hasAny: false, full: false } };
          });
          setWeekDates(wd);
          setWeekHeader(start.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
          setSlotsByDate({});
          return;
        }

        const res = await api.getSession(
          `/api/pt/project/sharePlanner?plannerId=${encodeURIComponent(plannerId)}`
        );
        const parsed = parseSharePlanner(res);
        setWeekDates(parsed.weekDates);
        setWeekHeader(parsed.weekHeader);
        setSlotsByDate(parsed.slotsByDate);
      } catch (e) {
        console.error('Failed to load sharePlanner:', e);
        setSlotsByDate({});
      }
    };

    load();
  }, [formData?.plannerId, formData?.session?.plannerId, formData?.session?.id]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };
// + PATCH: replace existing handleNext
const handleNext = async () => {
      const projectId = getProjectId(formData);
    if (!projectId) {
      alert("Missing project id from previous step. Please start from the PT project first.");
      return;
    }

  const plannerId =
    formData?.plannerId ??
    formData?.session?.plannerId ??
    formData?.session?.id ??
    null;

  if (!plannerId) {
    alert('Missing plannerId. Please create the session first.');
    return;
  }
  if (!selectedDate) {
    alert('Please select a date.');
    return;
  }

  try {
    // Build request body from the selected time range (or all-day fallback)
    let body;
    if (selectedTimeInfo && Array.isArray(selectedTimeInfo.time) && selectedTimeInfo.time.length > 0) {
      const times = [...selectedTimeInfo.time].sort(); // ensure "HH:mm" ascending
      const start = times[0];
      const last = times[times.length - 1];
      const end = plusOneHour(last); // API expects end at the hour after the last selected slot
      body = { date: selectedDate, start, end };
    } else {
      body = { date: selectedDate, allDay: true };
    }

    await api.postSession(
      `/api/pt/project/selectTime?plannerId=${encodeURIComponent(plannerId)}`,
      body
    );

      // Optional feedback:
      // alert("일정을 선택 완료하였습니다!");

      // Persist what we submitted (handy if the next step needs it)
      updateFormData({ selectedDate, chosenTimes, repeatConfig, selectedTimeBody: body });
      
      navigate(
          `/project/pt?projectId=${encodeURIComponent(projectId)}`
        );    
      } catch (e) {
      console.error('Failed to submit selected time:', e);
      alert('Failed to submit selected time. Please try again.');
    }
  };


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
            const { hasAny, full } = day.info || { hasAny: false, full: false };
            return (
              <div
                key={day.date}
                className="selcet-calendar-cell"
                onClick={() => handleDateClick(day.date)}
              >
                <div className="selcet-cell-label">{day.label}</div>
                <div
                  className={[
                    'selcet-cell-box',
                    selectedDate === day.date ? 'selected' : '',
                    full ? 'full-available' : (hasAny ? 'partial-available' : ''),
                  ].join(' ').trim()}
                />
              </div>
            );
          })}
        </div>
      </div>

      <p className="selected-info-text selecDate-selected-info">
        <CalenderCheckIcon className="select-calendar-icon" /> Selected:{' '}
        {selectedTimeInfo && Array.isArray(selectedTimeInfo.time) && selectedTimeInfo.time.length > 0 ? (
          <>
            {selectedTimeInfo.date},{' '}
            {selectedTimeInfo.time[0]} ~ {selectedTimeInfo.time[selectedTimeInfo.time.length - 1]}
          </>
        ) : (
          'Please select a time.'
        )}
      </p>



      <button className="project2-next-button" onClick={handleNext}>
        <ProjectNextIcon />
      </button>



      {modalOpen && (
        <DetailTimeModal
          date={selectedDate}
          availableSlots={slotsByDate[selectedDate] || []}   // ✅ pass server slots for that day
          onClose={() => setModalOpen(false)}
          onSave={({ date, time, availableCount }) => {
            setChosenTimes((prev) => ({ ...prev, [date]: time }));
            setSelectedTimeInfo({ date, time, availableCount });
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default SelectDate;