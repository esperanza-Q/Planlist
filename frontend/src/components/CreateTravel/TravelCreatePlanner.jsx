// src/components/CreateTravel/TravelCreatePlanner.jsx
import React, { useMemo, useState } from "react";
import { eachDayOfInterval, format } from "date-fns";
import { ReactComponent as BackIcon } from "../../assets/prev_arrow.svg";
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import PlaceMap from "../StandardCreatePage/PlaceMap";
import MemoCard from "../ProjectView/MemoCard";
import TravelPlannerCard from "./TravelPlannerCard";
import { api } from "../../api/client";
import "./TravelCreatePlanner.css";

// Map UI categories to API categories (exact spellings required by backend)
const toApiCategory = (c) => {
  const v = String(c || "").toLowerCase();
  if (v === "place") return "place";
  if (v === "restaurant") return "restaurant";
  // accept both "accommodation" (UI) and the backend's "accomodation"
  if (v === "accommodation" || v === "accomodation") return "accomodation";
  // default safe fallback
  return "place";
};

// (optional) translate the transport selector to API text; adjust if your API expects English
const toApiTransportation = (k) => {
  switch (k) {
    case "walk":
      return "도보";
    case "bus":
      return "버스";
    case "subway":
      return "지하철";
    case "car":
      return "자동차";
    default:
      return String(k || "");
  }
};

const TravelPlannerCreate = ({ formData, updateFormData, nextStep, prevStep }) => {
  // Places the user put into the daily itinerary via TravelPlannerCard
  // Structure is a flat list coming from child: [{ name, address, time, category, date: 'MM/dd', ... }]
  const [scheduledPlaces, setScheduledPlaces] = useState([]);
  // The wishlist places the user saved earlier (for the map on the right)
  const [selectedPlaces] = useState(formData.places || []);
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [posting, setPosting] = useState(false);

  // Build a map from tab label (MM/dd) -> ISO (yyyy-MM-dd) for the selected trip range
  const dateLabelToIso = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return {};
    const days = eachDayOfInterval({
      start: new Date(formData.startDate),
      end: new Date(formData.endDate),
    });
    const map = {};
    days.forEach((d) => {
      map[format(d, "MM/dd")] = format(d, "yyyy-MM-dd");
    });
    return map;
  }, [formData.startDate, formData.endDate]);

  // If you later surface "moves" in the parent, you can pass them up from TravelPlannerCard.
  // For now we send empty [] to the API (allowed).
  const buildPayload = () => {
    const byIsoDate = new Map(); // iso -> { schedules:[], moves:[] }

    for (const p of scheduledPlaces) {
      const iso = dateLabelToIso[p.date] || p.date; // tolerate already ISO
      if (!byIsoDate.has(iso)) byIsoDate.set(iso, { schedules: [], moves: [] });

      // Validate required fields and map
      const cat = toApiCategory(p.category);
      const startTime = (p.time || "").trim();

      byIsoDate.get(iso).schedules.push({
        placeName: p.name,
        category: cat,
        startTime, // API requires this; we'll validate before submit
      });

      // If you later collect "traffic" entries for this day, push here:
      // byIsoDate.get(iso).moves.push({ transportation: toApiTransportation(kind), duration_min: Number(duration) || 0 })
    }

    // Validate times now and throw a structured error to show the user
    for (const [iso, { schedules }] of byIsoDate.entries()) {
      for (const s of schedules) {
        if (!s.startTime) {
          const err = new Error("'startTime' is required");
          err._field = "startTime";
          err._date = iso;
          err._placeName = s.placeName;
          throw err;
        }
      }
    }

    // Build the request body in API shape
    const datePlanners = Array.from(byIsoDate.entries()).map(([iso, val]) => ({
      date: iso,
      schedules: val.schedules,
      moves: val.moves, // currently []
    }));

    return {
      projectId: formData.projectId,
      datePlanners,
      teamMemo: {
        content: formData.teamMemo || "",
      },
    };
  };

  const handleNext = async () => {
    if (!formData.projectId) {
      alert("프로젝트 ID가 없습니다. 이전 단계에서 프로젝트를 먼저 생성해 주세요.");
      return;
    }
    if (!scheduledPlaces.length) {
      if (!window.confirm("아직 일정이 비어 있습니다. 그대로 진행할까요?")) return;
    }

    let payload;
    try {
      payload = buildPayload();
    } catch (e) {
      // mirror backend 400 message shape when possible
      if (e?._field === "startTime") {
        alert(
          `시간이 비어 있습니다.\n날짜: ${e._date}\n장소: ${e._placeName}\n\n각 장소의 시간을 입력해 주세요.`
        );
      } else {
        alert(e?.message || "요청 본문 구성 중 오류가 발생했습니다.");
      }
      return;
    }

    const url = `/api/travel/${encodeURIComponent(formData.projectId)}/datePlanner/`;

    try {
      setPosting(true);
      // helpful logs
      console.log("[TravelPlanner] POST →", url);
      console.log("[TravelPlanner] payload →", payload);

      const res = await api.postSession(url, payload);
      console.debug("[TravelPlanner] response ←", res);

      // persist what we sent (and any server echo) and advance
      updateFormData({ planned: payload });
      nextStep();
    } catch (e) {
      // Try to show backend-style messages if your api client attaches body/status
      const status = e?.status;
      const body = e?.body;

      if (status === 400 && body?.field === "startTime") {
        alert(
          `서버 검증 실패: ${body?.message || "startTime이 필요합니다."}\n날짜: ${body?.date}\n장소: ${body?.placeName}`
        );
      } else if (status === 404 && body?.placeName) {
        alert(
          `위시리스트에 없는 장소입니다: ${body.placeName}\n먼저 장소를 저장한 뒤 다시 시도해 주세요.`
        );
      } else {
        alert(e?.message || "일정 저장에 실패했습니다.");
      }

      console.error("[TravelPlanner] POST failed", { status, body, error: e });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="planner-home-container">
      <div className="planner-section-div">
        <div className="choose-title">
          <button onClick={prevStep} className="prev-button">
            <BackIcon />
          </button>
          <h2>{formData.title}</h2>
        </div>

        <TravelPlannerCard
          formData={formData}
          selectedPlaces={selectedPlaces}
          setPlacesForDates={setScheduledPlaces}
          setHoveredPlace={setHoveredPlace}
        />
      </div>

      <div className="planner-section-div">
        <div className="map-section">
          <PlaceMap selectedPlace={hoveredPlace} places={selectedPlaces} />
        </div>
        {/* <MemoCard /> */}
      </div>

      <button className="project2-next-button" onClick={handleNext} disabled={posting}>
        <ProjectNextIcon />
      </button>
    </div>
  );
};

export default TravelPlannerCreate;
