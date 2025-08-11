import React, { useState, useRef, useEffect } from "react";
import "./Add_FreeTime.css";
import { ReactComponent as ArrowLeft } from "../../assets/arrow_down_left.svg";
import { ReactComponent as ArrowRight } from "../../assets/arrow_down_right.svg";
import { format } from "date-fns";
import { api } from "../../api/client";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }, (_, i) =>
  `${i === 0 ? 12 : i > 12 ? i - 12 : i}${i < 12 ? "am" : "pm"}`
);

const WeeklyCalendar = () => {
  const [selectedMap, setSelectedMap] = useState({}); // { weekKey: Set() }
  const [mainSelectedDay, setMainSelectedDay] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const isDragging = useRef(false);

  // ✅ Axios 응답 처리/params 사용으로 수정
  useEffect(() => {
    const controller = new AbortController();

    const fetchFreeTime = async () => {
      const startDate = format(currentWeekStart, "yyyy-MM-dd");
      const endDate = format(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");

      try {
        const { data } = await api.get("/api/home/freeTimeCalendar/getFreeTime", {
          params: { startDate, endDate },
          signal: controller.signal,
          timeout: 10000,
        });

        const freeTimeCalendar = data?.freeTimeCalendar ?? [];

        const newSet = new Set();
        const dayMs = 24 * 60 * 60 * 1000;
        const weekStart = new Date(currentWeekStart); weekStart.setHours(0,0,0,0);
        const toHour = (hhmm) => Number(String(hhmm || "00:00").split(":")[0]);

        freeTimeCalendar.forEach((item) => {
          const dateObj = new Date(item.date);
          dateObj.setHours(0,0,0,0);
          const col = Math.floor((dateObj.getTime() - weekStart.getTime()) / dayMs); // 0~6
          if (col < 0 || col > 6) return;

          if (item.allDay) {
            for (let h = 0; h < 24; h++) newSet.add(`${h}-${col}`);
          } else {
            const s = toHour(item.start);
            const e = toHour(item.end); // end exclusive
            for (let h = s; h < e; h++) newSet.add(`${h}-${col}`);
          }
        });

        const key = getWeekKey(currentWeekStart);
        setSelectedMap((prev) => ({ ...prev, [key]: newSet }));
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        console.error("Failed to fetch free time", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
      }
    };

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
    setSelectedMap((prev) => {
      const prevSet = prev[key] || new Set();
      const nextSet = typeof updater === 'function' ? updater(prevSet) : updater;
      return { ...prev, [key]: new Set(nextSet) };
    });
  };

  const handlePrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
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
    setSelectedCells((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  const handleCellMouseEnter = (row, col) => {
    if (!isDragging.current) return;
    const key = `${row}-${col}`;
    setSelectedCells((prev) => new Set(prev).add(key));
  };

  const handleMouseUp = () => { isDragging.current = false; };

  const isCellSelected = (row, col) => getSelectedCells().has(`${row}-${col}`);

  const isDayFullySelected = (col) => {
    const selectedCells = getSelectedCells();
    for (let row = 0; row < 24; row++) if (!selectedCells.has(`${row}-${col}`)) return false;
    return true;
  };

  // ✅ 저장도 Axios 표준 처리 + 에러 내용 노출
  const handleSave = async () => {
    try {
      const selectedCells = Array.from(getSelectedCells()); // ["hour-day", ...]
      const dayHourMap = {}; // dayIndex -> Set(hours)

      selectedCells.forEach((key) => {
        const [hourStr, dayStr] = key.split("-");
        const hour = Number(hourStr);
        const day = Number(dayStr);
        if (!dayHourMap[day]) dayHourMap[day] = new Set();
        dayHourMap[day].add(hour);
      });

      const hh = (h) => `${String(h).padStart(2, "0")}:00`;

      const freeTimeCalendar = Object.entries(dayHourMap).flatMap(([dayStr, hourSet]) => {
        const day = Number(dayStr);
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + day);
        const dateStr = format(date, "yyyy-MM-dd");

        const hours = Array.from(hourSet).sort((a, b) => a - b);
        if (hours.length === 24) return [{ date: dateStr, allDay: true }];

        const ranges = [];
        let start = hours[0], prev = hours[0];
        for (let i = 1; i < hours.length; i++) {
          if (hours[i] === prev + 1) prev = hours[i];
          else { ranges.push([start, prev + 1]); start = hours[i]; prev = hours[i]; }
        }
        ranges.push([start, prev + 1]); // end exclusive

        return ranges.map(([s, e]) => ({ date: dateStr, start: hh(s), end: hh(e) }));
      });

      const week = `${format(currentWeekStart, "yyyy-MM-dd")} ~ ${format(
        new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd"
      )}`;

      const payload = { week, freeTimeCalendar };
      console.log("📦 Save Payload:", payload);

      await api.post("/api/home/freeTimeCalendar/updateFreeTime", payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      alert("Free time saved!");
    } catch (err) {
      console.error("🔥 Save error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : '') ||
        err.message ||
        "Failed to save";
      alert(`저장 실패: ${msg}`);
    }
  };

  return (
    <div className="calendar-wrapper" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="calendar-header">
        <h2>Add Free Time</h2>
        <div className="calendar-controls">
          <button onClick={handlePrevWeek} className="nav-btn"><ArrowLeft /></button>
          <button onClick={handleNextWeek} className="nav-btn"><ArrowRight /></button>
          <button onClick={handleToday}>Today</button>
          <button className="save-btn" onClick={handleSave}>Save</button>
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
