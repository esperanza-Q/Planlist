import React, { useState, useRef, useEffect } from "react";
import "./Add_FreeTime.css";
import { ReactComponent as ArrowLeft } from "../../assets/arrow_down_left.svg";
import { ReactComponent as ArrowRight } from "../../assets/arrow_down_right.svg";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { api } from "../../api/client";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }, (_, i) =>
  `${i === 0 ? 12 : i > 12 ? i - 12 : i}${i < 12 ? "am" : "pm"}`
);

const WeeklyCalendar = () => {
  const [selectedMap, setSelectedMap] = useState({});
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [mainSelectedDay, setMainSelectedDay] = useState(null); // ✅ 추가
  const isDragging = useRef(false);

  // ✅ API에서 자유 시간 가져오기
  const fetchFreeTime = async () => {
    try {
      const startDate = format(currentWeekStart, "yyyy-MM-dd");
      const endDate = format(new Date(currentWeekStart.getTime() + 6*24*60*60*1000), "yyyy-MM-dd");

      const data = await api.get(`/api/home/freeTimeCalendar/getFreeTime?startDate=${startDate}&endDate=${endDate}`);
      console.log("Fetched free time:", data);


      const freeTimeCalendar = data?.freeTimeCalendar ?? [];
      const newSet = new Set();
      const weekStart = new Date(currentWeekStart); weekStart.setHours(0,0,0,0);
      const dayMs = 24 * 60 * 60 * 1000;
      const toHour = hhmm => Number(hhmm.split(":")[0]);

      freeTimeCalendar.forEach(item => {
        const dateObj = new Date(item.date);
        dateObj.setHours(0,0,0,0);
        const col = Math.floor((dateObj.getTime() - weekStart.getTime()) / dayMs);
        if (col < 0 || col > 6) return;

        if (item.allDay) {
          for (let h = 0; h < 24; h++) newSet.add(`${h}-${col}`);
        } else {
          const s = toHour(item.start);
          const e = toHour(item.end);
          for (let h = s; h < e; h++) newSet.add(`${h}-${col}`);
        }
      });

      const key = getWeekKey(currentWeekStart);
      setSelectedMap(prev => ({ ...prev, [key]: newSet }));
    } catch (err) {
      console.error("Failed to fetch free time", err);
    }
  };


  // useEffect에서 주마다 fetch
  useEffect(() => {
    const controller = new AbortController();
    fetchFreeTime();
    return () => controller.abort();
  }, [currentWeekStart]);

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getDateOfWeek(index) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + index);
    return date.getDate();
  }

  function getWeekKey(date) {
    return date.toISOString().split("T")[0];
  }

  const getSelectedCells = () => {
    const key = getWeekKey(currentWeekStart);
    return selectedMap[key] || new Set();
  };

  const setSelectedCells = (updater) => {
    const key = getWeekKey(currentWeekStart);
    setSelectedMap(prev => {
      const prevSet = prev[key] || new Set();
      const nextSet = typeof updater === 'function' ? updater(prevSet) : updater;
      return { ...prev, [key]: new Set(nextSet) };
    });
  };

  const handlePrevWeek = async () => {
  const currentKey = getWeekKey(currentWeekStart);
  const currentSelection = new Set(selectedMap[currentKey] || []);

  // 현재 주 저장
  await handleSave(currentWeekStart, currentSelection, false);

  // 주 변경
  const newStart = new Date(currentWeekStart);
  newStart.setDate(currentWeekStart.getDate() - 7);
  setCurrentWeekStart(newStart); // useEffect에서 fetchFreeTime 호출됨
};

const handleNextWeek = async () => {
  const currentKey = getWeekKey(currentWeekStart);
  const currentSelection = new Set(selectedMap[currentKey] || []);

  await handleSave(currentWeekStart, currentSelection, false);

  const newStart = new Date(currentWeekStart);
  newStart.setDate(currentWeekStart.getDate() + 7);
  setCurrentWeekStart(newStart);
};

const handleSave = async (weekStart = currentWeekStart, selectedCellsSet = null, showAlert = true) => {
  try {
    const selectedCells = Array.from(selectedCellsSet || getSelectedCells());
    const dayHourMap = {};

    if (selectedCells.length === 0) {
      const week = `${format(weekStart, "yyyy-MM-dd")} ~ ${format(
        new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd"
      )}`;
      await api.post(
        "/api/home/freeTimeCalendar/updateFreeTime",
        { week, freeTimeCalendar: [] },
        { headers: { "Content-Type": "application/json" } }
      );
      if (showAlert) alert("Free time saved!");
      return;
    }

    // 선택된 시간 → 날짜별로 그룹화
    selectedCells.forEach(key => {
      const [hourStr, dayStr] = key.split("-");
      const hour = Number(hourStr);
      const day = Number(dayStr);
      if (!dayHourMap[day]) dayHourMap[day] = new Set();
      dayHourMap[day].add(hour);
    });

    const hh = h => `${String(h).padStart(2, "0")}:00`;

    // 여기서만 freeTimeCalendar 생성
    const freeTimeCalendar = Object.entries(dayHourMap).flatMap(([dayStr, hourSet]) => {
      if (!hourSet.size) return [];

      const day = Number(dayStr);
      const date = new Date(weekStart);
        if (isNaN(date.getTime())) {
          console.warn("Invalid weekStart for date calculation:", weekStart);
          return [];
        }
        date.setDate(date.getDate() + day);
      const dateStr = format(date, "yyyy-MM-dd");

      const hours = Array.from(hourSet).sort((a, b) => a - b);

      // 하루 전체 선택
      if (hours.length === 24) return [{ date: dateStr, allDay: true }];

      // 연속 시간대 병합
      const ranges = [];
      let start = hours[0];
      let prev = hours[0];
      for (let i = 1; i < hours.length; i++) {
        if (hours[i] === prev + 1) {
          prev = hours[i];
        } else {
          ranges.push([start, prev + 1]);
          start = hours[i];
          prev = hours[i];
        }
      }
      ranges.push([start, prev + 1]);

      return ranges.map(([s, e]) => ({
        date: dateStr,
        start: hh(s),
        end: hh(e),
      }));
    });

    const week = `${format(weekStart, "yyyy-MM-dd")} ~ ${format(
      new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    )}`;

    await api.post(
      "/api/home/freeTimeCalendar/updateFreeTime",
      { week, freeTimeCalendar },
      { headers: { "Content-Type": "application/json" } }
    );

    if (showAlert) alert("Free time saved!");
  } catch (err) {
    console.error("🔥 Save error:", err);
    if (showAlert) alert("저장 실패: " + (err.response?.data?.message || err.message));
  }
};
  const handleToday = () => setCurrentWeekStart(getStartOfWeek(new Date()));

  const toggleMainDay = (colIdx) => {
    const selectedCells = getSelectedCells();
    const newSelection = new Set(selectedCells);
    let isFullySelected = true;
    for (let row = 0; row < 24; row++) {
      if (!newSelection.has(`${row}-${colIdx}`)) { isFullySelected = false; break; }
    }

    if (mainSelectedDay === colIdx && isFullySelected) {
      for (let row = 0; row < 24; row++) newSelection.delete(`${row}-${colIdx}`);
      setMainSelectedDay(null);
    } else {
      for (let row = 0; row < 24; row++) newSelection.add(`${row}-${colIdx}`);
      setMainSelectedDay(colIdx);
    }
    setSelectedCells(newSelection);
  };

  const handleCellMouseDown = (row, col, e) => {
    if (e.buttons !== 1) return;
    isDragging.current = true;
    const key = `${row}-${col}`;
    setSelectedCells(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  const handleCellMouseEnter = (row, col) => {
    if (!isDragging.current) return;
    const key = `${row}-${col}`;
    setSelectedCells(prev => new Set(prev).add(key));
  };

  const handleMouseUp = () => { isDragging.current = false; };

  const isCellSelected = (row, col) => getSelectedCells().has(`${row}-${col}`);

  const isDayFullySelected = (col) => {
    const selectedCells = getSelectedCells();
    for (let row = 0; row < 24; row++) if (!selectedCells.has(`${row}-${col}`)) return false;
    return true;
  };






  return (
    <div className="calendar-wrapper" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="calendar-header">
        <h2>Add Free Time</h2>
        <div className="calendar-controls">
          <button onClick={handlePrevWeek} className="nav-btn"><ArrowLeft /></button>
          <button onClick={handleNextWeek} className="nav-btn"><ArrowRight /></button>
          <button onClick={handleToday}>Today</button>
          <button className="save-btn" onClick={() => handleSave()}>Save</button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-top-row">
          <div className="time-column-header" />
          {days.map((day, index) => (
            <div
              key={index}
              className={`free-day-header ${isDayFullySelected(index) ? "main-selected" : ""}`}
              onClick={() => toggleMainDay(index)}
            >
              <div>{day}</div>
              <div className="date">{getDateOfWeek(index)}</div>
            </div>
          ))}
        </div>

        <div className="calendar-body">
          {hours.map((hour, rowIdx) => (
            <div className="calendar-row" key={rowIdx}>
              <div className="time-label">{hour}</div>
              {days.map((_, colIdx) => (
                <div
                  key={colIdx}
                  className={`calendar-cell ${
                    isCellSelected(rowIdx, colIdx)
                      ? isDayFullySelected(colIdx) ? "cell-main" : "cell-light"
                      : ""
                  }`}
                  onMouseDown={(e) => handleCellMouseDown(rowIdx, colIdx, e)}
                  onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
