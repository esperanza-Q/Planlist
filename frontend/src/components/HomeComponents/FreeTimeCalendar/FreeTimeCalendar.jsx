import React, { useState, useEffect, useMemo } from "react";
import Calendar from "react-calendar";
import "./FreeTimeCalendar.css";
import Cat_ver01 from "../../../assets/Cat_ver01.png";
import { api } from "../../../api/client";
import { startOfMonth, endOfMonth, addDays, format } from "date-fns";

// 월요일 시작
const mondayStart = (d) => {
  const x = new Date(d);
  const w = (x.getDay() + 6) % 7; // Mon=0 … Sun=6
  x.setDate(x.getDate() - w);
  x.setHours(0, 0, 0, 0);
  return x;
};

// 활성 월의 렌더 그리드 범위(앞뒤 여분 주 포함)
const getGridRange = (activeStartDate) => {
  const monthStart = startOfMonth(activeStartDate);
  const monthEnd = endOfMonth(activeStartDate);
  const gridStart = mondayStart(monthStart);
  const lastWeekMonday = mondayStart(monthEnd);
  const gridEnd = addDays(lastWeekMonday, 6); // 그 주의 일요일
  return { gridStart, gridEnd };
};

const toISODate = (date) => format(date, "yyyy-MM-dd");

const CalendarSection = () => {
  const [date, setDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [partialDates, setPartialDates] = useState([]);
  const [fullDates, setFullDates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchMonthAvailability = async () => {
      setLoading(true);
      try {
        const { gridStart, gridEnd } = getGridRange(activeStartDate);

        // 월 그리드를 주 단위로 쪼개서 병렬 호출
        const weeks = [];
        for (let d = new Date(gridStart); d <= gridEnd; d = addDays(d, 7)) {
          weeks.push(new Date(d));
        }

        const requests = weeks.map((ws) =>
          api.get("/api/home/freeTimeCalendar/getFreeTime", {
            params: {
              startDate: toISODate(ws),
              endDate: toISODate(addDays(ws, 6)),
            },
            timeout: 10000,
          })
        );

        const results = await Promise.all(requests);

        // 각 응답에서 freeTimeCalendar를 수집
        const items = results
          .map((r) => r?.data?.freeTimeCalendar ?? [])
          .flat();

        // 날짜별로 full/partial 집계
        const map = new Map(); // date -> { full: boolean, partial: boolean }
        items.forEach((entry) => {
          const d = entry.date;
          if (!map.has(d)) map.set(d, { full: false, partial: false });
          const rec = map.get(d);
          if (entry.allDay) rec.full = true;
          else rec.partial = true;
        });

        const full = [];
        const partial = [];
        for (const [d, { full: f, partial: p }] of map.entries()) {
          if (f) full.push(d);
          else if (p) partial.push(d);
        }

        if (!isCancelled) {
          setFullDates(full);
          setPartialDates(partial);
        }
      } catch (e) {
        console.error("Failed to fetch freeTimeCalendar:", {
          status: e?.response?.status,
          data: e?.response?.data,
          message: e?.message,
        });
        if (!isCancelled) {
          setFullDates([]);
          setPartialDates([]);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchMonthAvailability();
    return () => {
      isCancelled = true;
    };
  }, [activeStartDate]);

  const tileClassName = useMemo(() => {
    return ({ date }) => {
      const d = toISODate(date);
      if (fullDates.includes(d)) return "tile-full";
      if (partialDates.includes(d)) return "tile-partial";
      return null;
    };
  }, [fullDates, partialDates]);

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
          onActiveStartDateChange={({ activeStartDate }) =>
            setActiveStartDate(activeStartDate)
          }
          tileClassName={tileClassName}
        />
        <img src={Cat_ver01} alt="Cat" className="calendar-cat" />
      </div>

      {loading && <div className="calendar-loading">Loading availability…</div>}
      <div className="calendar-legend">
        <span className="legend-box tile-full" /> Full day available
        <span className="legend-box tile-partial" /> Partially available
      </div>
    </div>
  );
};

export default CalendarSection;
