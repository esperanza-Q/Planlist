// src/pages/ProjectView/ProjectViewMeetingDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../api/client";

import MeetingDetailInfoCard from "../../components/ProjectViewMeeting/MeetingDetailInfoCard";
import MemoCard from "../ProjectView/MemoCard";
import "./ProjectViewMeeting.css";

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

// 서버 응답(세션) → MeetingDetailInfoCard에서 쓰는 형태로 매핑
const normalizeSessionToProject = (raw) => {
  // raw는 api 래퍼에 따라 {data: {...}} 또는 {...}
  const d = raw?.data ?? raw ?? {};

  // 예상 가능한 필드들 방어적으로 흡수
  const title      = d.title ?? d.sessionTitle ?? d.name ?? "Untitled Session";
  const date       = toDate(d.date ?? d.startDate ?? d.sessionDate);
  const startTime  = toTime(d.startTime ?? d.beginTime ?? d.start);
  const endTime    = toTime(d.endTime ?? d.finishTime ?? d.end);
  const placeName  = d.placeName ?? d.locationName ?? d.place ?? "";
  const placeAddr  = d.placeAddress ?? d.locationAddress ?? d.address ?? "";

  // 참가자
  const users = Array.isArray(d.participants)
    ? d.participants.map((p, i) => ({
        name: p?.name ?? `Member ${i + 1}`,
        avatar: p?.profileImage ?? p?.profile_image ?? ProfilePic,
      }))
    : [];

  return {
    id: d.plannerId ?? d.sessionId ?? d.id ?? null,
    title,
    description: "",          // 세션 상세 설명 필드가 없으면 빈 값
    category: "meeting",
    status: "Active",
    repeat: "none",
    startDate: date,
    startTime: startTime ?? "none",
    endTime: endTime ?? "none",
    endDate: "none",
    placeName: placeName || "—",
    placeAddress: placeAddr || "—",
    users,
    meetings: [],            // 상세 화면에선 사용 안 함
  };
};

const exampleMemos = [
  { id: "1", type: "personal", project: "example project 1", content: "example memo...", category: "meeting" },
  { id: "2", type: "group",    project: "example project 2", content: "example memo...", category: "meeting" },
];

const ProjectViewMeetingDetails = () => {
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  // MeetingList에서 plannerId를 넘겼으니 우선 사용. (sessionId로 넘어오는 경우도 지원)
  const sessionId = query.get("plannerId") || query.get("sessionId");

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [project, setProject]   = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError("sessionId(plannerId)가 URL에 없습니다.");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      const url = `/api/meeting/session?sessionId=${encodeURIComponent(sessionId)}`;
      try {
        console.log("[MeetingDetails] GET →", url);
        const res = await api.getSession(
          `/api/meeting/session`, { params: { sessionId: sessionId } }
        );
        console.log("[MeetingDetails] response ←", res);

        const normalized = normalizeSessionToProject(res);
        setProject(normalized);
      } catch (e) {
        console.error("[MeetingDetails] fetch failed", e);
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
            <MeetingDetailInfoCard project={project} />
          )}
        </div>
        <MemoCard initialMemos={exampleMemos} />
      </div>
    </div>
  );
};

export default ProjectViewMeetingDetails;
