// src/components/CreateTravel/TravelSelectDate.jsx
// Fetch current & next month by startDate/endDate, cache by range,
// highlight ONLY dates common across all invitees,
// allow selecting ONLY those dates (full span must be recommended),
// and POST the selection on Next.
// Now with polling + focus/visibility refresh.

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import calendar_icon from "../../assets/calendar_icon.svg";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  format,
  isSameDay,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import "./TwoMonthCalendar.css";
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { ReactComponent as BackIcon } from "../../assets/prev_arrow.svg";
import leftArrow from "../../assets/arrow_down_left.svg";
import rightArrow from "../../assets/arrow_down_right.svg";

import { api } from "../../api/client";

// ---- helpers ----
const POLL_MS = 8000;

const shallowEqualArray = (a, b) => {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

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

/** Intersection of invitees' commonDates -> ["YYYY-MM-DD", ...] */
const extractCommonDatesFromAPI = (res) => {
  if (!Array.isArray(res) || res.length === 0) return [];

  const perInviteeSets = res
    // If you only want ACCEPTED participants, uncomment:
    // .filter((inv) => inv?.response === "ACCEPTED")
    .map((invitee) => {
      const dates = (invitee?.commonDates || [])
        .filter((d) => d?.date && (d?.allDay === true || d?.allDay == null))
        .map((d) => d.date);
      return new Set(dates);
    })
    .filter((s) => s.size > 0);

  if (perInviteeSets.length === 0) return [];

  let intersection = new Set(perInviteeSets[0]);
  for (let i = 1; i < perInviteeSets.length; i++) {
    const next = perInviteeSets[i];
    intersection = new Set([...intersection].filter((d) => next.has(d)));
    if (intersection.size === 0) break;
  }

  return [...intersection].sort((a, b) => a.localeCompare(b));
};

const TravelSelectDate = ({
  formData,
  updateFormData,
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
  const anchorRef = useRef(new Date()); // fixed anchor "now"

  // cache: { 'YYYY-MM-DD_YYYY-MM-DD': string[] /*commonDates*/ }
  const [rangeCache, setRangeCache] = useState(() => ({}));
  const inFlightRef = useRef(new Set());

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false); // lightweight spinner text during polling
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  // visible 2-month range (start of month for offset, end of next month)
  const visibleRange = useMemo(() => {
    const start = startOfMonth(addMonths(anchorRef.current, currentMonthOffset));
    const end = endOfMonth(addMonths(anchorRef.current, currentMonthOffset + 1));
    const startISO = format(start, "yyyy-MM-dd");
    const endISO = format(end, "yyyy-MM-dd");
    return { start, end, startISO, endISO, key: `${startISO}_${endISO}` };
  }, [currentMonthOffset]);

  // fetch helper (idempotent; can force)
  const fetchRange = useCallback(
    async (startISO, endISO, key, { force = false } = {}) => {
      if (!projectId) return;
      if (!force && rangeCache[key] !== undefined) return; // cached and not forced
      if (inFlightRef.current.has(key)) return; // already fetching

      inFlightRef.current.add(key);
      try {
        const res = await api.getSession(
          `/api/travel/project/${projectId}/travelSharedCalendar`,
          { params: { startDate: startISO, endDate: endISO } }
        );
        const commonDates = extractCommonDatesFromAPI(res);

        setRangeCache((prev) => {
          const prevArr = prev[key];
          // Only update if different to avoid re-renders
          if (prevArr !== undefined && shallowEqualArray(prevArr, commonDates)) return prev;
          return { ...prev, [key]: commonDates };
        });
        setErr(null);
      } catch (e) {
        setRangeCache((prev) =>
          prev[key] !== undefined ? prev : { ...prev, [key]: [] }
        );
        setErr("Failed to load shared calendar.");
      } finally {
        inFlightRef.current.delete(key);
      }
    },
    [projectId, rangeCache]
  );

  // Initial + on visible window change
  useEffect(() => {
    if (!projectId) return;
    let active = true;

    (async () => {
      setErr(null);
      if (rangeCache[visibleRange.key] === undefined) setLoading(true);
      try {
        await fetchRange(visibleRange.startISO, visibleRange.endISO, visibleRange.key, { force: false });
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [projectId, visibleRange.key, visibleRange.startISO, visibleRange.endISO, fetchRange, rangeCache]);

  // Polling + focus/visibility refresh
  useEffect(() => {
    if (!projectId) return;

    const doForceRefresh = async () => {
      setSyncing(true);
      try {
        await fetchRange(visibleRange.startISO, visibleRange.endISO, visibleRange.key, { force: true });
      } finally {
        setSyncing(false);
      }
    };

    // Poll
    const id = setInterval(doForceRefresh, POLL_MS);

    // Immediate refresh on focus / when tab becomes visible
    const onFocus = () => { void doForceRefresh(); };
    const onVis = () => { if (!document.hidden) void doForceRefresh(); };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [projectId, visibleRange.key, visibleRange.startISO, visibleRange.endISO, fetchRange]);

  // ONLY server's common dates for the visible window
  const visibleCommonDates = rangeCache[visibleRange.key] || [];
  const allowedDatesSet = useMemo(
    () => new Set(visibleCommonDates), [visibleCommonDates]
  );
  const recommendedRangesFromServer = useMemo(
    () => groupConsecutiveDates(visibleCommonDates),
    [visibleCommonDates]
  );

  // span must be fully allowed (every day between start and end is common)
  const isSpanFullyRecommended = useCallback((a, b) => {
    if (!a || !b) return false;
    const start = isBefore(a, b) ? a : b;
    const end   = isAfter(a, b) ? a : b;
    const days = eachDayOfInterval({ start, end });
    for (const d of days) {
      const key = format(d, "yyyy-MM-dd");
      if (!allowedDatesSet.has(key)) return false;
    }
    return true;
  }, [allowedDatesSet]);

  const handleClick = (date) => {
    const iso = format(date, "yyyy-MM-dd");
    // ignore clicks on non-recommended dates
    if (!allowedDatesSet.has(iso)) return;

    if (!startDate) {
      setStartDate(date);
      setEndDate(null);
    } else if (!endDate) {
      if (isSpanFullyRecommended(startDate, date)) {
        if (isSameDay(date, startDate)) setEndDate(date);
        else if (isBefore(date, startDate)) { setStartDate(date); setEndDate(null); }
        else setEndDate(date);
      } else {
        setStartDate(date);
        setEndDate(null);
      }
    } else {
      setStartDate(date);
      setEndDate(null);
    }
  };

  const getDateClass = (date) => {
    const iso = format(date, "yyyy-MM-dd");
    const isAllowed = allowedDatesSet.has(iso);

    // recommended styling
    let recommendedClass = "";
    if (isAllowed) {
      for (let range of recommendedRangesFromServer) {
        if (isSameDay(date, range.start) && isSameDay(date, range.end)) {
          recommendedClass = "recommended-single"; break;
        } else if (isSameDay(date, range.start)) {
          recommendedClass = "recommended-start"; break;
        } else if (isSameDay(date, range.end)) {
          recommendedClass = "recommended-end"; break;
        } else if (isAfter(date, range.start) && isBefore(date, range.end)) {
          recommendedClass = "recommended-in-range"; break;
        }
      }
    }

    // selection styling (only on allowed days)
    let selectionClass = "";
    if (isAllowed) {
      if (startDate && !endDate && isSameDay(date, startDate)) {
        selectionClass = "start-only";
      } else if (startDate && endDate) {
        if (isSameDay(date, startDate) && isSameDay(date, endDate)) {
          selectionClass = "start-only";
        } else if (isSameDay(date, startDate)) {
          selectionClass = "start";
        } else if (isSameDay(date, endDate)) {
          selectionClass = "end";
        } else if (isAfter(date, startDate) && isBefore(date, endDate)) {
          if (isSpanFullyRecommended(startDate, endDate)) {
            selectionClass = "in-range";
          }
        }
      }
    }

    const disabledClass = isAllowed ? "" : "disabled";
    return [recommendedClass, selectionClass, disabledClass].filter(Boolean).join(" ");
  };

  // ---- Next (POST confirm) ----
  const canSubmit = useMemo(() => {
    if (!projectId || !startDate) return false;
    const effectiveEnd = endDate || startDate; // allow single-day selection
    return isSpanFullyRecommended(startDate, effectiveEnd);
  }, [projectId, startDate, endDate, isSpanFullyRecommended]);

  const handleNext = async () => {
    if (!canSubmit) {
      alert("Please select a date (or range) entirely within the recommended dates.");
      return;
    }
    const startISO = format(startDate, "yyyy-MM-dd");
    const endISO = format(endDate || startDate, "yyyy-MM-dd");

    setSaving(true);
    try {
      // NOTE: append query params directly to the URL for POST
      const url =
        `/api/travel/project/${encodeURIComponent(projectId)}/travelSelectDate` +
        `?startDate=${encodeURIComponent(startISO)}&endDate=${encodeURIComponent(endISO)}`;

      const res = await api.postSession(url); // body X, query only

      // keep local state + advance
      updateFormData({
        title,
        startDate,
        endDate: endDate || startDate,
        projectId,
        confirmResponse: res,
      });
      nextStep();
    } catch (e) {
      console.error("Confirm travel dates failed:", e);
      alert(e?.message || "여행 날짜 확정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="calendar-wrapper">
        <div className="choose-title">
          <h3 className="calendar-title">{formData.title}</h3>
        </div>

        <div className="calendar-card">
          <div className="calendar-navigate">
            <button
              className="navigate-left"
              onClick={() => setCurrentMonthOffset((p) => p - 1)}
              aria-label="previous month"
              disabled={loading || saving}
            >
              <img src={leftArrow} alt="prev" />
            </button>
            <button
              className="navigate-right"
              onClick={() => setCurrentMonthOffset((p) => p + 1)}
              aria-label="next month"
              disabled={loading || saving}
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

                    {days.map((date) => {
                      const iso = format(date, "yyyy-MM-dd");
                      const isAllowed = allowedDatesSet.has(iso);
                      return (
                        <div className="date-wrapper" key={date.toISOString()}>
                          <div
                            onClick={() => isAllowed && !saving && handleClick(date)}
                            className={`calendar-date ${getDateClass(date)}`}
                            title={isAllowed ? "" : "Not a common date"}
                            role="button"
                            aria-disabled={!isAllowed || saving}
                            style={{ cursor: isAllowed && !saving ? "pointer" : "not-allowed" }}
                          >
                            {format(date, "d")}
                          </div>
                        </div>
                      );
                    })}
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
                {endDate ? format(endDate, "MM/dd") : startDate ? format(startDate, "MM/dd") : "--"}
              </span>
            </div>
            {loading && <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>loading…</span>}
            {syncing && !loading && <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.6 }}>syncing…</span>}
            {err && <span style={{ marginLeft: 8, fontSize: 12, color: "crimson" }}>failed to load</span>}
          </div>
        </div>
      </div>

      <button
        className="project-next-button"
        onClick={handleNext}
        title={!canSubmit ? "Select a recommended date or range" : ""}
      >
        {saving ? "Saving…" : <ProjectNextIcon />}
        <></>
      </button>
    </div>
  );
};

export default TravelSelectDate;
