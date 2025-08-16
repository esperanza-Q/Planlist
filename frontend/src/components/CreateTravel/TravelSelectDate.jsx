// TravelSelectDate.jsx — fetch current & next month by startdate/enddate, cache by range
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import calendar_icon from "../../assets/calendar_icon.svg";
import {
  startOfMonth, endOfMonth, eachDayOfInterval, addMonths, format,
  isSameDay, isAfter, isBefore, parseISO,
} from "date-fns";
import "./TwoMonthCalendar.css";
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { ReactComponent as BackIcon } from "../../assets/prev_arrow.svg";
import leftArrow from "../../assets/arrow_down_left.svg";
import rightArrow from "../../assets/arrow_down_right.svg";

import { api } from "../../api/client";

// ---- helpers ----
const groupConsecutiveDates = (isoDates = []) => {
  const sorted = [...isoDates]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .map((d) => parseISO(d));
  if (!sorted.length) return [];
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    if (cur.getTime() - prev.getTime() !== ONE_DAY) {
      ranges.push({ start, end: prev });
      start = cur;
    }
    prev = cur;
  }
  ranges.push({ start, end: prev });
  return ranges;
};

const unionRanges = (a = [], b = []) => [...a, ...b];

const TravelSelectDate = ({
  formData,
  updateFormData,
  recommendedDates = [],
  nextStep,
  prevStep,
}) => {
  const location = useLocation();
  const queryProjectId = useMemo(
    () => new URLSearchParams(location.search).get("projectId"),
    [location.search]
  );
  const projectId = useMemo(
    () => formData?.projectId ?? queryProjectId,
    [formData?.projectId, queryProjectId]
  );

  const [title, setTitle] = useState(formData.title || "");
  const [startDate, setStartDate] = useState(formData.startDate || null);
  const [endDate, setEndDate] = useState(formData.endDate || null);

  // which two months to show (offset 0 and 1 from anchor)
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  // Anchor: fixed "now" so initial shows current + next month
  const anchorRef = useRef(new Date());

  // range cache: { 'YYYY-MM-DD_YYYY-MM-DD': string[] /*commonDates*/ }
  const [rangeCache, setRangeCache] = useState(() => ({}));
  const inFlightRef = useRef(new Set()); // track range keys currently fetching

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // visible 2-month range (start of month for offset, end of next month)
  const visibleRange = useMemo(() => {
    const start = startOfMonth(addMonths(anchorRef.current, currentMonthOffset));
    const end = endOfMonth(addMonths(anchorRef.current, currentMonthOffset + 1));
    const startISO = format(start, "yyyy-MM-dd");
    const endISO = format(end, "yyyy-MM-dd");
    return { start, end, startISO, endISO, key: `${startISO}_${endISO}` };
  }, [currentMonthOffset]);

  // fetch helper (idempotent via inFlightRef + cache)
  const fetchRange = async (startISO, endISO, key) => {
    if (rangeCache[key] !== undefined) return; // already cached
    if (inFlightRef.current.has(key)) return;  // already fetching

    inFlightRef.current.add(key);
          // await api.postSession("/api/settings/friend/acceptRequest", {
          //   requestEmail: req.email,
          // });
    try {
      // ✅ send startdate & enddate (lowercase) as requested
      const res = await api.getSession(
        `/travel/project/${projectId}/travelSharedCalendar`,
        { startDate: startISO, endDate: endISO  }
      );
      const commonDates = Array.isArray(res?.commonDates) ? res.commonDates : [];
      setRangeCache((prev) => (prev[key] !== undefined ? prev : { ...prev, [key]: commonDates }));
    } catch (e) {
      setRangeCache((prev) => (prev[key] !== undefined ? prev : { ...prev, [key]: [] }));
      setErr("Failed to load shared calendar.");
    } finally {
      inFlightRef.current.delete(key);
    }
  };

  // fetch for the current 2-month window when projectId or offset changes
  useEffect(() => {
    if (!projectId) return;
    let active = true;

    (async () => {
      setErr(null);
      if (rangeCache[visibleRange.key] === undefined) setLoading(true);
      try {
        await fetchRange(visibleRange.startISO, visibleRange.endISO, visibleRange.key);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, visibleRange.key]);

  // build ranges for ONLY the visible window
  const visibleCommonDates = rangeCache[visibleRange.key] || [];
  const serverRanges = useMemo(
    () => groupConsecutiveDates(visibleCommonDates),
    [visibleCommonDates]
  );
  const allRecommended = useMemo(
    () => unionRanges(serverRanges, recommendedDates || []),
    [serverRanges, recommendedDates]
  );

  const handleNext = () => {
    updateFormData({ title, startDate, endDate, projectId });
    nextStep();
  };

  const handleClick = (date) => {
    if (!startDate) {
      setStartDate(date);
      setEndDate(null);
    } else if (!endDate) {
      if (isSameDay(date, startDate)) setEndDate(date);
      else if (isBefore(date, startDate)) { setStartDate(date); setEndDate(null); }
      else setEndDate(date);
    } else {
      setStartDate(date);
      setEndDate(null);
    }
  };

  const getDateClass = (date) => {
    let recommendedClass = "";
    for (let range of allRecommended) {
      if (isSameDay(date, range.start) && isSameDay(date, range.end)) { recommendedClass = "recommended-single"; break; }
      else if (isSameDay(date, range.start)) { recommendedClass = "recommended-start"; break; }
      else if (isSameDay(date, range.end)) { recommendedClass = "recommended-end"; break; }
      else if (isAfter(date, range.start) && isBefore(date, range.end)) { recommendedClass = "recommended-in-range"; break; }
    }
    if (startDate && !endDate && isSameDay(date, startDate)) return "start-only " + recommendedClass;
    if (isSameDay(date, startDate) && isSameDay(date, endDate)) return "start-only " + recommendedClass;
    if (startDate && isSameDay(date, startDate)) return "start " + recommendedClass;
    if (endDate && isSameDay(date, endDate)) return "end " + recommendedClass;
    if (startDate && endDate && isAfter(date, startDate) && isBefore(date, endDate)) return "in-range " + recommendedClass;
    return recommendedClass;
  };

  return (
    <div>
      <div className="calendar-wrapper">
        <div className="choose-title">
          <button onClick={prevStep} className="prev-button"><BackIcon /></button>
          <h3 className="calendar-title">Project name</h3>
        </div>

        <div className="calendar-card">
          <div className="calendar-navigate">
            <button
              className="navigate-left"
              onClick={() => setCurrentMonthOffset((p) => p - 1)}
              aria-label="previous month"
            >
              <img src={leftArrow} alt="prev" />
            </button>
            <button
              className="navigate-right"
              onClick={() => setCurrentMonthOffset((p) => p + 1)}
              aria-label="next month"
            >
              <img src={rightArrow} alt="next" />
            </button>
          </div>

          <div className="calendar-months">
            {[currentMonthOffset, currentMonthOffset + 1].map((offset) => {
              const monthStart = startOfMonth(addMonths(anchorRef.current, offset));
              const monthEnd = endOfMonth(addMonths(anchorRef.current, offset));
              const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

              return (
                <div className="calendar-month" key={offset}>
                  <h4 className="month-label">{format(monthStart, "MMMM yyyy")}</h4>
                  <div className="calendar-grid-travel">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <div className="calendar-day-name" key={d}>{d}</div>
                    ))}

                    {Array(monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1)
                      .fill("")
                      .map((_, i) => (<div className="calendar-empty" key={`pad-${offset}-${i}`} />))}

                    {days.map((date) => (
                      <div className="date-wrapper" key={date.toISOString()}>
                        <div
                          onClick={() => handleClick(date)}
                          className={`calendar-date ${getDateClass(date)}`}
                        >
                          {format(date, "d")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="calendar-footer">
          <img className="calendar-icon" src={calendar_icon} alt="calendar" />
          <div className="calendar-show-selected">
            <div>
              <span>start: </span>
              <span className="calendar-selected-date">
                {startDate ? format(startDate, "MM/dd") : "--"}
              </span>
            </div>
            <div>
              <span>end: </span>
              <span className="calendar-selected-date">
                {endDate ? format(endDate, "MM/dd") : "--"}
              </span>
            </div>
            {loading && <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>loading…</span>}
            {err && <span style={{ marginLeft: 8, fontSize: 12, color: "crimson" }}>failed to load</span>}
          </div>
        </div>
      </div>

      <button className="project-next-button" onClick={handleNext}>
        <ProjectNextIcon />
      </button>
    </div>
  );
};

export default TravelSelectDate;
