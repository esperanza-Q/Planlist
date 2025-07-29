import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "./FreeTimeCalendar.css";
import Cat_ver01 from "../../assets/Cat_ver01.png";

const CalendarSection = () => {
  const [date, setDate] = useState(new Date());
  const [partialDates, setPartialDates] = useState([]);
  const [fullDates, setFullDates] = useState([]);


  // API 호출 (예시용)
  useEffect(() => {
    const mockData = {
      partialAvailableDates: ["2025-08-14", "2025-08-15", "2025-08-16"],
      fullyAvailableDates: ["2025-08-26"]
    };
    setPartialDates(mockData.partialAvailableDates);
    setFullDates(mockData.fullyAvailableDates);
  }, []);


  /* API에 맞게 변경
  useEffect(() => {
  const fetchAvailability = async () => {
    try {
      const response = await fetch("/api/available-dates"); // ✅ 실제 API endpoint
      const data = await response.json();

      setPartialDates(data.partialAvailableDates || []);
      setFullDates(data.fullyAvailableDates || []);
    } catch (error) {
      console.error("Failed to fetch availability data:", error);
    }
  };

  fetchAvailability();
}, []);
*/

  return (
    <div className="calendar-section">
      <h2 className="calendar-title">My Free Time Calendar</h2>
      <div className="calendar-container">
        <Calendar
          onChange={setDate}
          value={date}
          locale="en-US"
          prev2Label={null}
          next2Label={null}
          tileClassName={({ date }) => {
            const dateStr = date.toISOString().split("T")[0];
            if (fullDates.includes(dateStr)) return "tile-full";
            if (partialDates.includes(dateStr)) return "tile-partial";
            return null;
          }}
        />
        <img src={Cat_ver01} alt="Cat_ver01" className="calendar-cat" />
      </div>
    </div>
  );
};

export default CalendarSection;
