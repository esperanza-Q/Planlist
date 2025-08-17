// src/components/CreatePT/SelectDate.jsx
import React, { useState, useEffect, useMemo } from 'react';
import './SelectDate.css';
import DetailTimeModal from '../StandardCreatePage/DetailTimeModalLinked';
import RepeatingModal from '../StandardCreatePage/RepeatingModal';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

import RepeatIcon from '../../icons/RepeatIcon';
import CalendarAltIcon from "../../icons/CalendarAltIcon";
import CalenderCheckIcon from "../../icons/CalenderCheckIcon";
import { api } from '../../api/client';
import { useNavigate, useLocation } from 'react-router-dom';

// ---------- helpers ----------
const pad2 = (n) => String(n).padStart(2, '0');
const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

// NEW: robust time utils
const normalizeTime = (hhmm) => {
  const [hStr = '0', mStr = '0'] = String(hhmm).split(':');
  const h = Math.max(0, Math.min(23, parseInt(hStr, 10) || 0));
  const m = Math.max(0, Math.min(59, parseInt(mStr, 10) || 0));
  return `${pad2(h)}:${pad2(m)}`;
};

const timeToMinutes = (hhmm) => {
  const [hStr = '0', mStr = '0'] = String(hhmm).split(':');
  return (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0);
};

/** Add one hour but do NOT roll into the next day. If it would cross midnight, clamp to 23:59. */
const safeAddHourSameDay = (hhmm) => {
  const [hStr = '0', mStr = '0'] = normalizeTime(hhmm).split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (h >= 23) return '23:59';
  const endH = h + 1;
  if (endH >= 24) return '23:59';
  return `${pad2(endH)}:${pad2(m)}`;
};

// If your backend prefers seconds, send HH:mm:ss
const toHms = (hhmm) => `${normalizeTime(hhmm)}:00`;

const formatLabel = (isoDate) => {
  const dt = new Date(`${isoDate}T00:00:00`);
  const weekday = dt.toLocaleDateString('en-US', { weekday: 'long' });
  const dayNum = dt.getDate();
  return `${weekday} ${dayNum}`;
};

// Parse server payload -> full week + availability + slotsByDate
const parseSharePlanner = (data) => {
  const slots = Array.isArray(data?.ALL)
    ? data.ALL
    : (Array.isArray(data?.all) ? data.all : []);

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

  let weekStartISO = null;
  if (typeof data?.week === 'string' && data.week.includes('~')) {
    weekStartISO = data.week.split('~')[0].trim();
  } else {
    const now = new Date();
    const dow = now.getDay();
    const monday = addDays(now, dow === 0 ? -6 : (1 - dow));
    weekStartISO = toISODate(monday);
  }

  const start = new Date(`${weekStartISO}T00:00:00`);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    const iso = toISODate(d);
    const label = formatLabel(iso);
    const info = perDate[iso] || { hasAny: false, full: false };
    return { date: iso, label, info };
  });

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
  const { search } = useLocation();

  // Read plannerId from query params
  const plannerIdFromQS = useMemo(
    () => new URLSearchParams(search).get("plannerId"),
    [search]
  );

  // Single canonical plannerId (QS first, then fallbacks)
  const plannerId =
    plannerIdFromQS ??
    formData?.plannerId ??
    formData?.session?.plannerId ??
    formData?.session?.id ??
    null;

  const [selectedDate, setSelectedDate] = useState(formData.selectedDate || '');
  const [weekDates, setWeekDates] = useState([]);
  const [weekHeader, setWeekHeader] = useState(' ');

  const [modalOpen, setModalOpen] = useState(false);
  const [repeatModalOpen, setRepeatModalOpen] = useState(false);
  const [repeatConfig, setRepeatConfig] = useState(null);

  const [chosenTimes, setChosenTimes] = useState({});
  const [selectedTimeInfo, setSelectedTimeInfo] = useState(null);

  const [slotsByDate, setSlotsByDate] = useState({});

  // 🔌 Load schedule using plannerId (from query param or fallback)
  useEffect(() => {
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
  }, [plannerId]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  // UPDATED: safe time window construction (prevents HourOfDay=24)
  const handleNext = async () => {
    const projectId = getProjectId(formData);
    if (!projectId) {
      alert("Missing project id from previous step. Please start from the PT project first.");
      return;
    }

    if (!plannerId) {
      alert('Missing plannerId. Please create the session first.');
      return;
    }
    if (!selectedDate) {
      alert('Please select a date.');
      return;
    }

    try {
      let body;
      if (selectedTimeInfo && Array.isArray(selectedTimeInfo.time) && selectedTimeInfo.time.length > 0) {
        // normalize + sort times
        const normalized = selectedTimeInfo.time.map(normalizeTime);
        normalized.sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

        const start = normalized[0];
        const last  = normalized[normalized.length - 1];
        const end   = safeAddHourSameDay(last); // clamp if would roll past 24

        // if end <= start (shouldn't happen), clamp to 23:59
        const finalStart = toHms(start);
        const finalEnd   = timeToMinutes(end) <= timeToMinutes(start) ? '23:59:00' : toHms(end);

        body = { date: selectedDate, start: finalStart, end: finalEnd };
      } else {
        body = { date: selectedDate, allDay: true };
      }

      await api.postSession(
        `/api/pt/project/selectTime?plannerId=${encodeURIComponent(plannerId)}`,
        body
      );

      updateFormData({ selectedDate, chosenTimes, repeatConfig, selectedTimeBody: body, plannerId });
      navigate(`/project/pt?projectId=${encodeURIComponent(projectId)}`);
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
            {normalizeTime(selectedTimeInfo.time[0])}
            {' ~ '}
            {normalizeTime(selectedTimeInfo.time[selectedTimeInfo.time.length - 1])}
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
          availableSlots={slotsByDate[selectedDate] || []}
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
