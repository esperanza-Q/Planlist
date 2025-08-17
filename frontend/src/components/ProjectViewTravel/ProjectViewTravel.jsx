// src/components/ProjectViewTravel/ProjectViewTravel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { api } from "../../api/client";

import ViewPlannerCard from "./ViewPlannerCard";
import "./ProjectViewTravel.css";
import TravelInfoCard from "./TravelInfoCard";
import ProfilePic from "../../assets/ProfilePic.png";
import MemoCard from "../../components/ProjectView/MemoCard";

// ---------- small utils ----------
const parseId = (v) => {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return /^\d+$/.test(s) ? parseInt(s, 10) : null;
};

// "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"
const toDate = (str) => {
  if (!str) return "TBD";
  const s = String(str);
  if (s.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return s.slice(0, 10);
};
const toTime = (str) => {
  if (!str) return "TBD";
  const s = String(str);
  const parts = s.split("T");
  if (parts.length < 2) return "TBD";
  return parts[1].slice(0, 5) || "TBD";
};

// category normalization
const normalizeCategory = (c) => {
  const v = String(c || "").toLowerCase();
  if (v.startsWith("accom")) return "accommodation";
  if (["restaurant", "dining", "food", "맛집", "식당", "restaurant".toUpperCase()].includes(v)) return "restaurant";
  if (v === "place" || v === "PLACE".toLowerCase()) return "place";
  // also accept server’s UPPERCASE
  if (v === "restaurant") return "restaurant";
  if (v === "place") return "place";
  return "place";
};

// Map to TravelInfoCard shape
const tripToInfoProject = (trip) => ({
  id: trip.project_id,
  title: trip.project_name,
  description: trip.description || "",
  category: "travel",
  status: trip.status || "Active",
  repeat: "none",
  startDate: toDate(trip.start_date),
  startTime: toTime(trip.start_date),
  endTime: toTime(trip.end_date),
  endDate: toDate(trip.end_date),
  placeName: trip.location || "",
  placeAddress: trip.location || "",
  users: Array.isArray(trip.participants)
    ? trip.participants.map((p) => ({
        name: p.username || p.name || "user",
        avatar: p.profileImage || ProfilePic,
      }))
    : [],
  meetings: [],
});

const ProjectViewTravel = () => {
  const { projectId: pathId } = useParams();
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // support /project/travel/:projectId and /project/travel?projectId=34
  const idFromPath = parseId(pathId);
  const idFromQuery = parseId(query.get("projectId"));
  const projectId = idFromPath ?? idFromQuery;

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");


  const handleFinished = async () => {
  try{
    const res = await api.getSession(
              `/api/travel/${projectId}/finished`
            );
    alert("project status changed: finished");
  }
  catch (e){
    console.error(e);
  }
}

  const addGoogleCalendar = async () => {
  try{
    //POST  /api/google-calendar/project/{projectId}/travel
    const res = await api.postSession(
              `/api/google-calendar/project/${projectId}/travel`
            );
    alert("project added to google calendar");
  }
  catch (e){
    console.error(e);
  }
}


  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!projectId) {
        setLoading(false);
        setErrMsg("프로젝트 ID가 없습니다. URL을 확인해 주세요.");
        return;
      }
      setLoading(true);
      setErrMsg("");

      try {
        // Your current endpoint (kept as-is)
        const data = await api.getSession(`/api/travel/project/${encodeURIComponent(projectId)}`);
        // data shape (per your sample):
        // { project, participants, memo, projectDetails }

        const p = data?.project || {};

        // 🔁 NEW: map projectDetails → datePlanners
        const details = Array.isArray(data?.projectDetails) ? data.projectDetails : [];
        const byDate = {};
        details.forEach((row, idx) => {
          const d = row.date; // "YYYY-MM-DD"
          if (!d) return;

          if (!byDate[d]) byDate[d] = { date: d, schedules: [], moves: [] };

          // schedule row
          byDate[d].schedules.push({
            placeName: row.wishlistName || row.placeName || "",
            category: normalizeCategory(row.category),
            address: row.address || "",
            description: row.memo || "", // server memo field
            startTime: toTime(row.visitTime), // from ISO
          });

          // attach any transport rows (kept in order)
          if (Array.isArray(row.transportations)) {
            row.transportations.forEach((t) => {
              byDate[d].moves.push({
                transportation: t.transportation || t.kind || t.type || "",
                duration_min:
                  t.duration_min ?? t.durationMin ?? t.duration ?? null,
              });
            });
          }
        });

        const datePlanners = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

        // participants normalize
        const normParticipants = Array.isArray(data?.participants)
          ? data.participants.map((u, i) => ({
              id: u.id ?? i,
              username: u.name ?? u.username ?? `user${i}`,
              profileImage: u.profileImage,
            }))
          : [];

        // build the object ViewPlannerCard expects
        const normalized = {
          project_id: p.projectId ?? projectId,
          project_name: p.projectName ?? "",
          description: "",
          start_date: p.startDate || null,
          end_date: p.endDate || null,
          location: p.location || "",
          status: p.status || "INPROGRESS",
          confirmedAt: p.confirmedAt || null,
          participants: normParticipants,
          datePlanners, // 👈 mapped above
          // keep a simple team memo view from memo array if you like
          teamMemo: {
            content:
              Array.isArray(data?.memo) && data.memo.length > 0
                ? `[${data.memo.length} memos]` // no content in sample; show count hint
                : "",
          },
        };

        if (!cancelled) setTrip(normalized);
      } catch (e) {
        if (!cancelled) setErrMsg(e?.message || "여행 정보를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [projectId]);

  const infoProject = useMemo(() => (trip ? tripToInfoProject(trip) : null), [trip]);

  const initialMemos = useMemo(() => {
    const list = [];
    if (trip?.teamMemo?.content) {
      list.push({
        id: "team-memo",
        type: "group",
        project: trip.project_name || `project ${projectId}`,
        content: trip.teamMemo.content,
        category: "travel",
      });
    }
    return list;
  }, [trip, projectId]);

  if (loading) {
    return (
      <div className="screen">
        <div className="project-view-div">로딩 중...</div>
      </div>
    );
  }

  if (errMsg) {
    return (
      <div className="screen">
        <div className="project-view-div">
          <p style={{ color: "crimson" }}>{errMsg}</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="screen">
        <div className="project-view-div">
          <p>표시할 여행 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="project-view-div">
        <div className="layout">
          {infoProject && <TravelInfoCard project={infoProject} />}
          <button className="meet-button addfinish"
            style={{marginTop:"20px", marginBottom:"20px"}}
            onClick={addGoogleCalendar}
          >add to google calendar</button>
          <MemoCard initialMemos={initialMemos} />
        </div>

        <div className="layout">
          <ViewPlannerCard project={trip} />
          
          <button className="meet-button addfinish"
            onClick={handleFinished}
          >mark as finished</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectViewTravel;
