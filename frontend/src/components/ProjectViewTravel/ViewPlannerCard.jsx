// src/components/ProjectViewTravel/ViewPlannerCard.jsx
import React, { useMemo, useState } from "react";
import arrow_long from "../../assets/arrow_long.svg";
import location_icon from "../../assets/location_icon_selected.svg";
import bus from "../../assets/bus.svg";

const getDateOnly = (iso) => {
  if (!iso) return "";
  const s = String(iso);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

const ViewPlannerCard = ({ project }) => {
  // 안전 가드: planners가 없거나 비어도 동작
  const planners = Array.isArray(project?.datePlanners) ? project.datePlanners : [];

  const initialDate =
    planners[0]?.date ||
    getDateOnly(project?.start_date) ||
    getDateOnly(project?.project?.startDate) || // 혹시 다른 스키마일 경우 대비
    "";

  const [selectedDate, setSelectedDate] = useState(initialDate);

  // 현재 선택된 날짜의 플래너
  const currentPlanner = useMemo(
    () => planners.find((dp) => dp.date === selectedDate) || null,
    [planners, selectedDate]
  );

  // 타임라인 구성: schedule → move(i) → schedule → move(i+1) ...
  const timeline = useMemo(() => {
    if (!currentPlanner) return [];

    const schedules = Array.isArray(currentPlanner.schedules)
      ? [...currentPlanner.schedules]
      : [];

    // "HH:mm" 문자열 가정. 값이 없으면 뒤로.
    schedules.sort((a, b) => {
      const ta = (a?.startTime || "99:99");
      const tb = (b?.startTime || "99:99");
      return ta.localeCompare(tb);
    });

    const moves = Array.isArray(currentPlanner.moves) ? currentPlanner.moves : [];
    const rows = [];

    for (let i = 0; i < schedules.length; i++) {
      rows.push({ ...schedules[i], type: "schedule", _k: `s-${i}` });
      if (moves[i]) {
        rows.push({ ...moves[i], type: "move", _k: `m-${i}` });
      }
    }
    return rows;
  }, [currentPlanner]);

  return (
    <div className="view-planner">
      <div className="card-title">Planner</div>

      {/* 날짜 탭 */}
      {planners.length > 0 ? (
        <div className="tab planner-tab">
          {planners.map((dp) => (
            <button
              key={dp.date}
              onClick={() => setSelectedDate(dp.date)}
              disabled={selectedDate === dp.date}
              className={selectedDate === dp.date ? "active" : ""}
            >
              {dp.date}
            </button>
          ))}
        </div>
      ) : (
        <div className="tab planner-tab" style={{ opacity: 0.7 }}>
          일정 탭이 없습니다
        </div>
      )}

      <div className="planner-day-content">
        {currentPlanner && timeline.length > 0 ? (
          timeline.map((item, idx) =>
            item.type === "schedule" ? (
              <div className="schedule-item" key={item._k ?? idx}>
                <img className="schedule-icon" src={location_icon} alt="place" />
                <div className="schedule-text">
                  <strong>{item.placeName || "제목 없음"}</strong>
                  <div className="schedule-view-time">
                    {item.startTime || ""}
                  </div>
                  {item.address ? <div>{item.address}</div> : null}
                  {item.description ? <p>{item.description}</p> : null}
                </div>
              </div>
            ) : (
              <div className="move-item" key={item._k ?? idx}>
                <img className="arrow" src={arrow_long} alt="arrow" />
                <img className="buts" src={bus} alt="bus" />
                <p>
                  {item.transportation || "이동"} –{" "}
                  {item.duration_min ?? item.durationMin ?? item.duration ?? ""} min
                </p>
              </div>
            )
          )
        ) : (
          <div style={{ padding: "12px", opacity: 0.7 }}>
            이 날짜에 표시할 일정이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPlannerCard;
