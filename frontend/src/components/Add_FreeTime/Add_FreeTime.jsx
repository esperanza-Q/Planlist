import React, { useState, useRef, useEffect } from "react";
import "./Add_FreeTime.css";
import { ReactComponent as ArrowLeft } from "../../assets/arrow_down_left.svg";
import { ReactComponent as ArrowRight } from "../../assets/arrow_down_right.svg";
import { format } from "date-fns";





const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 24 }, (_, i) =>
  `${i === 0 ? 12 : i > 12 ? i - 12 : i}${i < 12 ? "am" : "pm"}`
);

const WeeklyCalendar = () => {
  const [selectedMap, setSelectedMap] = useState({}); // { weekKey: Set() }
  const [mainSelectedDay, setMainSelectedDay] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const isDragging = useRef(false);

  useEffect(() => {
  const fetchFreeTime = async () => {
    const startDate = format(currentWeekStart, "yyyy-MM-dd");
    const endDate = format(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");

    try {
      const response = await fetch(`/api/home/getFreeTime?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();

      const newSet = new Set();
      data.forEach(({ hour, day }) => {
        newSet.add(`${hour}-${day}`);
      });

      const key = getWeekKey(currentWeekStart);
      setSelectedMap((prev) => ({
        ...prev,
        [key]: newSet
      }));
    } catch (err) {
      console.error("Failed to fetch free time", err);
    }
  };

  fetchFreeTime();
}, [currentWeekStart]);

  function getStartOfWeek(date) {
    const newDate = new Date(date);
    const day = newDate.getDay();
    const diff = newDate.getDate() - day;
    return new Date(newDate.setDate(diff));
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
      return {
        ...prev,
        [key]: new Set(nextSet)
      };
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

  const handleToday = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  };

  const toggleMainDay = (colIdx) => {
    const selectedCells = getSelectedCells();
    const newSelection = new Set(selectedCells);
    let isFullySelected = true;
    for (let row = 0; row < 24; row++) {
      if (!newSelection.has(`${row}-${colIdx}`)) {
        isFullySelected = false;
        break;
      }
    }

    if (mainSelectedDay === colIdx && isFullySelected) {
      for (let row = 0; row < 24; row++) {
        newSelection.delete(`${row}-${colIdx}`);
      }
      setMainSelectedDay(null);
    } else {
      for (let row = 0; row < 24; row++) {
        newSelection.add(`${row}-${colIdx}`);
      }
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
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleCellMouseEnter = (row, col) => {
    if (!isDragging.current) return;
    const key = `${row}-${col}`;
    setSelectedCells((prev) => new Set(prev).add(key));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const isCellSelected = (row, col) => getSelectedCells().has(`${row}-${col}`);

  const isDayFullySelected = (col) => {
    const selectedCells = getSelectedCells();
    for (let row = 0; row < 24; row++) {
      if (!selectedCells.has(`${row}-${col}`)) return false;
    }
    return true;
  };

  const handleSave = () => {
  const selectedCells = Array.from(getSelectedCells());

  // 날짜별 그룹핑: day index -> 시간 배열
  const dayHourMap = {};
  selectedCells.forEach((key) => {
    const [hourStr, dayStr] = key.split("-");
    const hour = Number(hourStr);
    const day = Number(dayStr);

    if (!dayHourMap[day]) {
      dayHourMap[day] = [];
    }
    dayHourMap[day].push(hour);
  });

  const freeTimeCalendar = Object.entries(dayHourMap).map(([dayStr, hours]) => {
    const day = Number(dayStr);
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + day);
    const dateStr = format(date, "yyyy-MM-dd");

    if (hours.length === 24) {
      return {
        date: dateStr,
        allDay: true
      };
    }

    const sorted = hours.sort((a, b) => a - b);

    // start ~ end time (연속 시간으로 보냄)
    const startHour = sorted[0];
    const endHour = sorted[sorted.length - 1] + 1;

    const formatTime = (h) => `${h.toString().padStart(2, "0")}:00`;

    return {
      date: dateStr,
      start: formatTime(startHour),
      end: formatTime(endHour)
    };
  });

  // week 범위 문자열 만들기
  const week = `${format(currentWeekStart, "yyyy-MM-dd")} ~ ${format(
    new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
    "yyyy-MM-dd"
  )}`;

  const payload = {
    week,
    freeTimeCalendar
  };

  console.log("📦 Save Payload:", payload); // 확인용 로그

  fetch("/api/home/updateFreeTime", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update free time");
      alert("Free time saved!");
    })
    .catch((err) => {
      console.error("🔥 Save error:", err);
      alert(err.message);
    });
};

  return (
    <div className="calendar-wrapper" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="calendar-header">
        <h2>Add Free Time</h2>
        <div className="calendar-controls">
          <button onClick={handlePrevWeek} className="nav-btn">
            <ArrowLeft />
          </button>
          <button onClick={handleNextWeek} className="nav-btn">
            <ArrowRight />
          </button>
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
                  className={`calendar-cell ${isCellSelected(rowIdx, colIdx)
                    ? isDayFullySelected(colIdx)
                      ? "cell-main"
                      : "cell-light"
                    : ""}`}
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