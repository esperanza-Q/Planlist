// src/components/CreateTravel/TravelCreatePlanner.jsx
import React, { useMemo, useState } from "react";
import { eachDayOfInterval, format } from "date-fns";
import { ReactComponent as BackIcon } from "../../assets/prev_arrow.svg";
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import PlaceMap from "../StandardCreatePage/PlaceMap";
import TravelPlannerCard from "./TravelPlannerCard";
import { api } from "../../api/client";
import "./TravelCreatePlanner.css";
import TravelMemoCard from "../ProjectViewTravel/TravelMemoCard";
import MemoModal from "../../components/StandardCreatePage/MemoModal";

// ---------- Helpers ----------
const toApiCategory = (c) => {
  const v = String(c || "").trim().toLowerCase();
  if (["place", "장소", "spot", "poi"].includes(v)) return "PLACE";
  if (["restaurant", "food", "식당", "맛집"].includes(v)) return "RESTAURANT";
  if (["accommodation", "accomodation", "숙소", "hotel", "stay", "lodge"].includes(v)) {
    return "ACCOMMODATION";
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
  return dateLabelToIso[v] || v;
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
  category: p.category ?? "place",
  date: p.date || "",
  time: p.time || "",
  latitude: p.latitude ?? p.lat ?? null,
  longitude: p.longitude ?? p.lng ?? null,
});

const TravelPlannerCreate = ({ formData, updateFormData, nextStep, prevStep }) => {
  // scheduledPlaces come from TravelPlannerCard via setPlacesForDates
  const [scheduledPlaces, setScheduledPlaces] = useState([]);
  const [selectedPlaces] = useState(formData.places || []); // from previous step
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [posting, setPosting] = useState(false);

  // NEW: memos state + modal
  const [memos, setMemos] = useState(formData.memos || []);
  const [showMemoModal, setShowMemoModal] = useState(false);

  // "MM/dd" → "yyyy-MM-dd"
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
  //   items: [{ ... visitTime=ISO, transport=[...] }, ...],
  //   teamMemo: string,
  //   notes: [{ noteId?, type, title, content }, ...]   // <-- added (non-breaking; server can ignore if unused)
  // }
// inside src/components/CreateTravel/TravelCreatePlanner.jsx

const buildPayload = () => {
  const items = (scheduledPlaces || []).map((p) => {
    const dateISO = toISODate(p.date, dateLabelToIso); // "yyyy-MM-dd"

    // normalize transport rows gathered from TravelPlannerCard
    const transportsSrc = Array.isArray(p.transportations)
      ? p.transportations
      : Array.isArray(p.moves)
        ? p.moves
        : [];

    const transportations = transportsSrc.map((t) => {
      const kind =
        t.transportation ??
        t.kind ??
        t.type ??
        toApiTransportation(t.key ?? t.mode ?? t.name);

      const durationMin =
        t.durationMin ?? t.duration_min ?? t.minutes ?? t.duration ?? 0;

      // DTO requires LocalDate → send just the date (yyyy-MM-dd)
      const travelDate = dateISO || null;

      return {
        transportation: toApiTransportation(kind),
        durationMin: asNumber(durationMin, 0),
        travelDate, // LocalDate only
      };
    });

    // visitTime ISO (this one *is* LocalDateTime on server)
    let visitTime = (p.time || p.visitTime || "").trim(); // "HH:mm"
    if (dateISO && visitTime) {
      visitTime = `${dateISO}T${visitTime}:00`;
    } else {
      visitTime = "";
    }

    const latitude = p.latitude ?? p.lat ?? p.y ?? null;
    const longitude = p.longitude ?? p.lng ?? p.lon ?? p.x ?? null;

    return {
      inviteeId: p.inviteeId ?? formData.inviteeId ?? null,
      date: dateISO,
      category: toApiCategory(p.category),
      wishlistId: p.wishlistId ?? p.id ?? null,
      memo: p.memo ?? "",
      cost: asNumber(p.cost, 0),
      address: p.address ?? "",
      latitude: latitude != null ? Number(latitude) : null,
      longitude: longitude != null ? Number(longitude) : null,
      visitTime,
      transportations, // ✅ correct key name
    };
  });

  // validations
  for (const it of items) {
    if (!it.date) throw new Error("날짜가 비었습니다.");
    if (!it.category) throw new Error("카테고리가 비었습니다.");
    if (!it.visitTime) throw new Error("시간(visitTime)이 비었습니다.");
  }

  // include memos (server may ignore)
  const notes = (memos || []).map((m) => ({
    noteId: m.noteId ?? null,
    type: m.type,
    title: m.title ?? m.project ?? "",
    content: m.content ?? "",
  }));

  return {
    items,
    teamMemo: formData.teamMemo || "",
    notes,
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

    // Prepare scheduled places for FinalMap (do NOT overwrite formData.places)
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

        // persist memos + scheduled for next step
        updateFormData({ planned: body, scheduledPlaces: scheduledForNext, memos });
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

    // Category spelling flip retry for "accommodation"
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
        <div className="choose-title choose-title-plan">
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
         
        </div>

        {/* Controlled TravelMemoCard */}
        <TravelMemoCard
          memos={memos}
          onChange={(next) => {
            setMemos(next);
            updateFormData({ memos: next }); // keep in wizard state
          }}
          onAddClick={() => setShowMemoModal(true)}
        />
      </div>

      <button className="project2-next-button" onClick={handleNext} disabled={posting}>
        <ProjectNextIcon />
      </button>

      {showMemoModal && (
        <MemoModal
          onClose={() => setShowMemoModal(false)}
          onSave={(newMemo) => {
            setMemos((prev) => {
              const next = [newMemo, ...prev];
              updateFormData({ memos: next });
              return next;
            });
            setShowMemoModal(false);
          }}
          projectId={formData.projectId}
          projectName={formData.title}
          formData={formData}
        />
      )}
    </div>
  );
};

export default TravelPlannerCreate;
