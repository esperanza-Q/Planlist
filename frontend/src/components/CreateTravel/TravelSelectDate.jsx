// TravelSelectDate.jsx — fetch fixed year=2025, month=8 exactly once
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

import profile1 from "../../assets/ProfilePic.png";
import profile2 from "../../assets/ProfilePic02.svg";
import profile3 from "../../assets/ProfilePic03.svg";
import profile4 from "../../assets/ProfilePic04.svg";
import { ReactComponent as ProfileOverflowIcon } from "../../assets/profile_overflow.svg";

import { api } from "../../api/client";

// mock thumbs (unchanged)
const mockFriends = [
  { id: 1, name: "NAME1", email: "example1@gmail.com", profileImage: profile1 },
  { id: 2, name: "NAME2", email: "example2@gmail.com", profileImage: profile2 },
  { id: 3, name: "NAME3", email: "example3@gmail.com", profileImage: profile3 },
  { id: 4, name: "NAME4", email: "example4@gmail.com", profileImage: profile4 },
  { id: 5, name: "NAME5", email: "example5@gmail.com", profileImage: profile1 },
  { id: 6, name: "NAME6", email: "example6@gmail.com", profileImage: profile1 },
];

// utilities
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

  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  const todayRef = useRef(new Date()); // fixed anchor for calendar UI

  const [serverRanges, setServerRanges] = useState([]); // from API (Aug 2025 only)
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // ✅ Fetch exactly year=2025&month=8 once when projectId is ready
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await api.getSession(`/Travel/${projectId}/SharedCalendar`, {
          params: { year: 2025, month: 8 },
          validateStatus: () => true,
        });
        if (cancelled) return;

        if (res.status === 200) {
          const isoList = Array.isArray(res.data?.commonDates) ? res.data.commonDates : [];
          setServerRanges(groupConsecutiveDates(isoList));
        } else if (res.status === 204) {
          setServerRanges([]); // no common dates
        } else {
          console.warn("SharedCalendar non-OK:", res.status, res.data);
          setServerRanges([]);
          setErr("Failed to load shared calendar.");
        }
      } catch (e) {
        if (!cancelled) {
          console.error("SharedCalendar error:", e);
          setErr("Failed to load shared calendar.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId]);

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
          {/* <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.75 }}>
            {projectId ? `Project #${projectId}` : "No projectId"}
            {loading ? " · loading…" : ""}
            {err ? " · error" : ""}
          </div> */}
        </div>

        {/* <div className="selcet-friends-profile select-friends">
          {mockFriends.slice(0, 3).map((f) => (
            <img key={f.id} src={f.profileImage} alt={f.name} className="selcet-profile-img" />
          ))}
          {mockFriends.length > 4 && <ProfileOverflowIcon className="profile-skip-icon" />}
        </div> */}

        <div className="calendar-card">
          <div className="calendar-navigate">
            <button className="navigate-left" onClick={() => setCurrentMonthOffset((p) => p - 1)}>
              <img src={leftArrow} alt="prev" />
            </button>
            <button className="navigate-right" onClick={() => setCurrentMonthOffset((p) => p + 1)}>
              <img src={rightArrow} alt="next" />
            </button>
          </div>

          <div className="calendar-months">
            {[currentMonthOffset, currentMonthOffset + 1].map((offset) => {
              const monthStart = startOfMonth(addMonths(todayRef.current, offset));
              const monthEnd = endOfMonth(addMonths(todayRef.current, offset));
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
