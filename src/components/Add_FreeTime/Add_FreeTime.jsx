import React, { useState, useRef } from "react";
import "./Add_FreeTime.css";
import { ReactComponent as ArrowLeft } from "../../assets/arrow_down_left.svg";
import { ReactComponent as ArrowRight } from "../../assets/arrow_down_right.svg";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 24 }, (_, i) =>
  `${i === 0 ? 12 : i > 12 ? i - 12 : i}${i < 12 ? "am" : "pm"}`
);

const WeeklyCalendar = () => {
  const [selectedMap, setSelectedMap] = useState({}); // { weekKey: Set() }
  const [mainSelectedDay, setMainSelectedDay] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const isDragging = useRef(false);

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
    const selectedData = Array.from(getSelectedCells()).map((key) => {
      const [hour, day] = key.split("-").map(Number);
      return { hour, day };
    });

    fetch("/api/save-freetime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ freetimes: selectedData })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save free time");
        alert("Free time saved!");
      })
      .catch((err) => alert(err.message));
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