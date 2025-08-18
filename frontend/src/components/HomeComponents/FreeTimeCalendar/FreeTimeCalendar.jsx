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
  const fetchFreeTime = async () => {
    setLoading(true);
    try {
      const { gridStart, gridEnd } = getGridRange(activeStartDate);
      const res = await api.get(`/api/home/freeTimeCalendar/getFreeTime?startDate=${toISODate(gridStart)}&endDate=${toISODate(gridEnd)}`);
      const items = res?.freeTimeCalendar ?? [];

        // ---------- helpers ----------
      const isAllDayRange = (it) =>
        it?.allDay === true ||
        (it?.start === "00:00" && (it?.end === "23:59" || it?.end === "24:00"));
 
      // 종료가 23:59(또는 24:00)이면 24로 처리해서 [s, e) 구간으로 계산
      const parseHour = (hhmm, { isEnd } = { isEnd: false }) => {
        const [hs, ms] = String(hhmm || "00:00").split(":");
        const h = Number(hs), m = Number(ms);
        if (isEnd) {
          if ((h === 23 && m === 59) || (h === 24 && (isNaN(m) || m === 0))) return 24;
          return h;
        }
        return h;
      };
      const keyOf = (dateLike) => toISODate(new Date(dateLike));

            // 날짜별 커버리지 집계 (시간 단위 Set로 모으고, allDay/연속 커버 판단)
      const perDay = new Map(); // d -> { full:boolean, hours:Set<number> }
      for (const entry of items) {
        const d = keyOf(entry.date);
        if (!d) continue;
        if (!perDay.has(d)) perDay.set(d, { full: false, hours: new Set() });
        const rec = perDay.get(d);
        if (isAllDayRange(entry)) {
          rec.full = true;
          continue;
        }
        const s = parseHour(entry.start, { isEnd: false });
        const e = parseHour(entry.end,   { isEnd: true  }); // [s, e)
        for (let h = s; h < e; h++) rec.hours.add(h);
     }

      const full = [];
      const partial = [];
      for (const [d, rec] of perDay.entries()) {
        if (rec.full || rec.hours.size === 24) full.push(d);
        else if (rec.hours.size > 0) partial.push(d);
      }
 
      setFullDates(full);
      setPartialDates(partial);
    } catch (e) {
      console.error("Failed to fetch freeTimeCalendar:", e);
      setFullDates([]);
      setPartialDates([]);
    } finally {
      setLoading(false);
    }
  };

  fetchFreeTime();
}, [activeStartDate]);
 

  const tileClassName = useMemo(() => {
  return ({ date }) => {
    const toISODate = (date) => {
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      if (isNaN(date.getTime())) {
        console.warn("⚠️ 잘못된 날짜 값:", date);
        return null;
      }
      return format(date, "yyyy-MM-dd");
    };

    const d = toISODate(date);
    if (!d) return null;
    if (fullDates.includes(d)) return "tile-full";
    if (partialDates.includes(d)) return "tile-partial";
    return null;
  };
}, [fullDates, partialDates]);


  return (
    <div className="calendar-section">
      <h2 className="My-calendar-title">My Free Time Calendar</h2>
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
    </div>
  );
};

export default CalendarSection;
