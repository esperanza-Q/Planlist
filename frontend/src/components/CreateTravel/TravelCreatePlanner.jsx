// src/components/CreateTravel/TravelCreatePlanner.jsx
import React, { useMemo, useState } from "react";
import { eachDayOfInterval, format } from "date-fns";
import { ReactComponent as BackIcon } from "../../assets/prev_arrow.svg";
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import PlaceMap from "../StandardCreatePage/PlaceMap";
import TravelPlannerCard from "./TravelPlannerCard";
import { api } from "../../api/client";
import "./TravelCreatePlanner.css";
import MemoCard from "../ProjectView/MemoCard";

// ---------- Helpers ----------
const toApiCategory = (c) => {
  const v = String(c || "").trim().toLowerCase();
  if (["place", "장소", "spot", "poi"].includes(v)) return "PLACE";
  if (["restaurant", "food", "식당", "맛집"].includes(v)) return "RESTAURANT";
  if (["accommodation", "accomodation", "숙소", "hotel", "stay", "lodge"].includes(v)) {
    return "ACCOMMODATION"; // if backend expects single 'm', we'll flip on retry below
  }
  return "PLACE";
};

const toApiTransportation = (k) => {
  const v = String(k || "").trim().toLowerCase();
  if (["walk", "도보"].includes(v)) return "도보";
  if (["bus", "버스"].includes(v)) return "버스";
  if (["subway", "지하철", "metro", "train"].includes(v)) return "지하철";
  if (["car", "자동차", "drive", "taxi"].includes(v)) return "자동차";
  return k || "";
};

const toISODate = (labelOrIso, dateLabelToIso) => {
  const v = String(labelOrIso || "");
  return dateLabelToIso[v] || v; // supports "MM/dd" labels or already ISO "yyyy-MM-dd"
};

const asNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const swapAccommodationSpelling = (payload, toSingleM) => {
  const from = toSingleM ? "ACCOMMODATION" : "ACCOMODATION";
  const to = toSingleM ? "ACCOMODATION" : "ACCOMMODATION";
  const cloned = JSON.parse(JSON.stringify(payload));
  for (const item of cloned.items || []) {
    if (item.category === from) item.category = to;
  }
  return cloned;
};

// Prepare a lightweight display object for FinalMap (without changing formData.places)
const toDisplayPlace = (p, i) => ({
  id: p.wishlistId ?? p.id ?? `${p.name || "place"}-${p.date || i}`,
  name: p.name ?? "",
  address: p.address ?? "",
  description: p.description ?? "",
  category: p.category ?? "place", // keep original label from Step 4
  date: p.date || "",              // keep "MM/dd" for FinalMap tabs
  time: p.time || "",
  latitude: p.latitude ?? p.lat ?? null,
  longitude: p.longitude ?? p.lng ?? null,
});

// ---------- Component ----------
const TravelPlannerCreate = ({ formData, updateFormData, nextStep, prevStep }) => {
  // scheduledPlaces come from TravelPlannerCard via setPlacesForDates
  // shape: { name, address, time, category, date:'MM/dd'|'yyyy-MM-dd', wishlistId?, inviteeId?, cost?, latitude?, longitude?, transportations?[]|moves?[] }
  const [scheduledPlaces, setScheduledPlaces] = useState([]);
  const [selectedPlaces] = useState(formData.places || []); // wishlist for right map (from previous step)
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [posting, setPosting] = useState(false);

  // Map "MM/dd" → "yyyy-MM-dd" for the chosen date range
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

  // Build payload expected by backend:
  // {
  //   items: [
  //     {
  //       inviteeId, date, category, wishlistId, memo, cost, address,
  //       latitude, longitude, visitTime(ISO),
  //       transport: [{ transportation, durationMin, travelDate }]
  //     }, ...
  //   ],
  //   teamMemo: "..."
  // }
  const buildPayload = () => {
    const items = (scheduledPlaces || []).map((p) => {
      const dateISO = toISODate(p.date, dateLabelToIso);

      // normalize transport rows from either p.transportations or p.moves
      const transportsSrc = Array.isArray(p.transportations)
        ? p.transportations
        : Array.isArray(p.moves)
          ? p.moves
          : [];

      const transport = transportsSrc.map((t) => {
        const kind =
          t.transportation ??
          t.kind ??
          t.type ??
          toApiTransportation(t.key ?? t.mode ?? t.name);

        const durationMin =
          t.durationMin ?? t.duration_min ?? t.minutes ?? t.duration ?? 0;

        // travelDate: ISO "yyyy-MM-ddTHH:mm:ss"
        let travelDate = t.travelDate ?? t.dateTime ?? t.when ?? null;
        if (!travelDate) {
          const tt = (t.time || "").trim(); // "HH:mm"
          if (dateISO && tt) travelDate = `${dateISO}T${tt}:00`;
        }

        return {
          transportation: toApiTransportation(kind),
          durationMin: asNumber(durationMin, 0),
          travelDate: travelDate || null,
        };
      });

      // visitTime: ISO "yyyy-MM-ddTHH:mm:ss"
      let visitTime = (p.time || p.visitTime || "").trim(); // "HH:mm"
      if (dateISO && visitTime) {
        visitTime = `${dateISO}T${visitTime}:00`; // e.g. "2025-08-13T12:02:00"
      } else {
        visitTime = ""; // fallback: empty string triggers validation error
      }

      const latitude = p.latitude ?? p.lat ?? p.y ?? null;
      const longitude = p.longitude ?? p.lng ?? p.lon ?? p.x ?? null;

      return {
        inviteeId: p.inviteeId ?? formData.inviteeId ?? null,
        date: dateISO,
        category: toApiCategory(p.category), // "PLACE" | "RESTAURANT" | "ACCOMMODATION"
        wishlistId: p.wishlistId ?? p.id ?? null,
        memo: p.memo ?? "",
        cost: asNumber(p.cost, 0),
        address: p.address ?? "",
        latitude: latitude != null ? Number(latitude) : null,
        longitude: longitude != null ? Number(longitude) : null,
        visitTime, // ISO datetime
        // backend expects "transport" (not "transportations")
        transport,
      };
    });

    // minimal validations (surface 400s early)
    for (const it of items) {
      if (!it.date) throw new Error("날짜가 비었습니다.");
      if (!it.category) throw new Error("카테고리가 비었습니다.");
      if (!it.visitTime) throw new Error("시간(visitTime)이 비었습니다.");
    }

    return {
      items,
      // backend expects a plain string here
      teamMemo: formData.teamMemo || "",
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

    // Prepare scheduled places for FinalMap (DO NOT overwrite formData.places)
    const scheduledForNext = (scheduledPlaces || []).map(toDisplayPlace);

    let payload;
    try {
      payload = buildPayload();
    } catch (e) {
      alert(e?.message || "요청 본문 구성 중 오류가 발생했습니다.");
      return;
    }

    const url = `/api/travel/${encodeURIComponent(formData.projectId)}/dateplanner/save`;
    const postOnce = async (body) => {
      setPosting(true);
      try {
        console.log("[TravelPlanner] POST →", url);
        console.log("[TravelPlanner] payload →", JSON.stringify(body, null, 2));
        const res = await api.postSession(url, body);
        console.debug("[TravelPlanner] response ←", res);

        // Pass scheduled places to next step without touching formData.places
        updateFormData({ planned: body, scheduledPlaces: scheduledForNext });

        nextStep();
        return { ok: true, res };
      } catch (err) {
        return { ok: false, err };
      } finally {
        setPosting(false);
      }
    };

    // 1st try
    let { ok, err } = await postOnce(payload);
    if (ok) return;

    // If 400 and category-related, auto-toggle ACCOMMODATION↔ACCOMODATION once and retry
    const status = err?.status;
    const msg = err?.body?.message || err?.message || "";
    const categoryError = status === 400 && /카테고리|category/i.test(msg);
    const hasAccommodation =
      JSON.stringify(payload).includes("ACCOMMODATION") ||
      JSON.stringify(payload).includes("ACCOMODATION");

    if (categoryError && hasAccommodation) {
      const usedSingleM = JSON.stringify(payload).includes("ACCOMODATION");
      const flipped = swapAccommodationSpelling(payload, !usedSingleM);
      const retry = await postOnce(flipped);
      if (retry.ok) return;
      err = retry.err;
    }

    // Fallback error handling
    if (status === 404 && err?.body?.placeName) {
      alert(`위시리스트에 없는 장소입니다: ${err.body.placeName}\n먼저 장소를 저장한 뒤 다시 시도해 주세요.`);
    } else if (status === 400 && /startTime|visitTime/i.test(err?.body?.field || "")) {
      alert(`서버 검증 실패: ${err?.body?.message || "시간 값이 필요합니다."}`);
    } else if (status === 400 && categoryError) {
      alert(`서버가 카테고리 값을 인식하지 못했습니다.\n전송값을 확인하세요: PLACE / RESTAURANT / ACCOMMODATION(또는 ACCOMODATION)`);
    } else {
      alert(err?.message || "일정 저장에 실패했습니다.");
    }
    console.error("[TravelPlanner] POST failed", { status, body: err?.body, error: err });
  };

  return (
    <div className="planner-home-container">
      <div className="planner-section-div">
        <div className="choose-title">
          <button onClick={prevStep} className="prev-button"><BackIcon /></button>
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
        <MemoCard/>
      </div>

      <button className="project2-next-button" onClick={handleNext} disabled={posting}>
        <ProjectNextIcon />
      </button>
    </div>
  );
};

export default TravelPlannerCreate;
