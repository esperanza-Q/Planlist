// src/pages/ProjectView/ProjectViewStandardDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../api/client";
import StandardDetailInfoCard from "../../components/ProjectViewMeeting/MeetingDetailInfoCard";

import MemoCard from "../ProjectView/MemoCard";
import "./ProjectViewStandard.css";

import ProfilePic from "../../assets/ProfilePic.png";

// ----- helpers -----
const toDate = (d) => {
  if (!d) return null;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = new Date(d);
  return isNaN(dt) ? null : dt.toISOString().slice(0, 10);
};

const toTime = (t) => {
  if (!t) return null;
  // accept "10:00", "10:00:00", Date string
  if (typeof t === "string") {
    const m = t.match(/^(\d{2}):(\d{2})/);
    return m ? `${m[1]}:${m[2]}` : t;
  }
  const dt = new Date(t);
  if (isNaN(dt)) return null;
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

// 서버 응답(세션) → StandardDetailInfoCard에서 쓰는 형태로 매핑
// (keys are defensive: accepts multiple likely server shapes)
const normalizeSessionToProject = (raw) => {
  const d = raw?.data ?? raw ?? {};

  const title      = d.title ?? d.sessionTitle ?? d.name ?? "Untitled Session";
  const date       = toDate(d.date ?? d.startDate ?? d.sessionDate);
  const startTime  = toTime(d.startTime ?? d.beginTime ?? d.start);
  const endTime    = toTime(d.endTime ?? d.finishTime ?? d.end);

  // location variations
  const loc        = d.location ?? {};
  const placeName  = d.placeName ?? loc.place_name ?? loc.name ?? "";
  const placeAddr  = d.placeAddress ?? loc.address ?? loc.place_address ?? "";

  // participants
  const users = Array.isArray(d.participants)
    ? d.participants.map((p, i) => ({
        name: p?.name ?? `Member ${i + 1}`,
        avatar: p?.profileImage ?? p?.profile_image ?? ProfilePic,
      }))
    : [];

  return {
    id: d.plannerId ?? d.sessionId ?? d.id ?? null,
    title,
    description: "",
    category: "standard",
    status: "Active",
    repeat: "none",
    startDate: date,
    startTime: startTime ?? "none",
    endTime: endTime ?? "none",
    endDate: "none",
    placeName: placeName || "—",
    placeAddress: placeAddr || "—",
    users,
    meetings: [],
  };
};

const exampleMemos = [
  { id: "1", type: "personal", project: "example project 1", content: "example memo...", category: "standard" },
  { id: "2", type: "group",    project: "example project 2", content: "example memo...", category: "standard" },
];

const ProjectViewStandardDetails = () => {
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  // Accept both ?plannerId= and ?sessionId=
  const sessionId = query.get("plannerId") || query.get("sessionId");

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError("sessionId(plannerId)가 URL에 없습니다.");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // GET /api/standard/session?sessionId=...
        console.log("[StandardDetails] GET → /api/standard/session", { sessionId });
        const res = await api.getSession(`/api/standard/session`, {
          params: { sessionId },
        });
        console.log("[StandardDetails] response ←", res);

        const normalized = normalizeSessionToProject(res);
        setProject(normalized);
      } catch (e) {
        console.error("[StandardDetails] fetch failed", e);
        setError("세션 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  return (
    <div className="screen">
      <div className="project-view-meeting detail">
        <div className="layout ProjectViewMeeting">
          {loading && <div style={{ padding: 12 }}>Loading…</div>}
          {error && <div style={{ padding: 12, color: "crimson" }}>{error}</div>}
          {!loading && !error && project && (
            <StandardDetailInfoCard project={project} />
          )}
        </div>
        <MemoCard initialMemos={exampleMemos} />
      </div>
    </div>
  );
};

export default ProjectViewStandardDetails;
