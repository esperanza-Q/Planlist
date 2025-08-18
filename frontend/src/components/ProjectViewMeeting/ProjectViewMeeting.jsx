// src/pages/ProjectView/ProjectViewMeeting.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../api/client";

import MeetingInfoCard from "../../components/ProjectViewMeeting/MeetingInfoCard";
import MeetingList from "../../components/ProjectViewMeeting/MeetingList";
import MemoCard from "../ProjectView/MemoCard";
import "./ProjectViewMeeting.css";

import ProfilePic from "../../assets/ProfilePic.png";

const sampleProject = {
  id: 1,
  title: "Team Branding Workshop",
  description: "Weekly catch-up and planning meeting.",
  category: "meeting",
  status: "Finished",
  repeat: "tuesday",
  startDate: "2025-07-01",
  endDate: "2025-07-07",
  users: [
    { name: "A", avatar: ProfilePic }, { name: "B", avatar: ProfilePic }, { name: "C", avatar: ProfilePic },
    { name: "A", avatar: ProfilePic }, { name: "B", avatar: ProfilePic }, { name: "C", avatar: ProfilePic },
    { name: "A", avatar: ProfilePic }, { name: "B", avatar: ProfilePic }, { name: "C", avatar: ProfilePic },
    { name: "A", avatar: ProfilePic }, { name: "B", avatar: ProfilePic }, { name: "C", avatar: ProfilePic },
  ],
  meetings: ["meeting1", "meeting2", "meeting3", "meeting4", "meeting5"],
};

const exampleMemos = [
  { id: "1", type: "personal", project: "example project 1", content: "example project description. showing the first few sentences of the memo.", category: "meeting" },
  { id: "2", type: "group",    project: "example project 2", content: "example project description. showing the first few sentences of the memo.", category: "meeting" },
  { id: "3", type: "personal", project: "example project 3", content: "example project description. showing the first few sentences of the memo.", category: "meeting" },
  { id: "4", type: "group",    project: "example project 4", content: "example project description. showing the first few sentences of the memo.", category: "meeting" },
  { id: "5", type: "personal", project: "example project 5", content: "example project description. showing the first few sentences of the memo.", category: "meeting" },
  { id: "6", type: "group",    project: "example project 6", content: "example project description. showing the first few sentences of the memo.", category: "meeting" },
];

// 서버 응답 → 화면에서 쓰는 형태로 가볍게 정규화
const normalizeProject = (raw) => {
  const d = raw?.data ?? raw ?? {};
  const id = d.projectId ?? d.id ?? null;
  const title = d.title ?? d.projectName ?? d.name ?? "Untitled Meeting Project";
  const description = d.description ?? d.memo ?? "";
  const status = d.status ?? "Active";
  const repeat = d.repeat ?? d.recurring ?? "none";
  const startDate = d.startDate ?? d.beginDate ?? d.start ?? null;
  const endDate = d.endDate ?? d.finishDate ?? d.end ?? null;

  const users =
    Array.isArray(d.participants) ? d.participants.map((p, i) => ({
      name: p?.name ?? p?.nickname ?? p?.displayName ?? `Member ${i + 1}`,
      avatar: p?.profileImage ?? p?.profile_image ?? ProfilePic,
    })) :
    Array.isArray(d.users) ? d.users.map((u, i) => ({
      name: u?.name ?? `Member ${i + 1}`,
      avatar: u?.avatar ?? u?.profileImage ?? ProfilePic,
    })) : [];

  const meetings =
    Array.isArray(d.meetings) ? d.meetings :
    Array.isArray(d.sessions) ? d.sessions.map((s, i) => s?.title ?? `meeting${i + 1}`) :
    [];

  return {
    id, title, description,
    category: "meeting",
    status, repeat,
    startDate, endDate,
    users, meetings,
  };
};

const ProjectViewMeeting = () => {
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const projectId = query.get("projectId");

  const [project, setProject] = useState(sampleProject);

  useEffect(() => {
    if (!projectId) {
      console.warn("[Meeting] projectId missing in URL query (?projectId=...)");
      return;
    }
    (async () => {
      const url = `/api/meeting/project/${encodeURIComponent(projectId)}`;
      try {
        console.log("[Meeting] GET →", url);
        const res = await api.getSession(url);
        console.log("[Meeting] response ← raw:", res);
        console.log("[Meeting] response.data ←", res?.data ?? res);

        // 화면에 보여줄 데이터도 최신으로 갱신(선택)
        const normalized = normalizeProject(res);
        setProject((prev) => ({ ...prev, ...normalized }));
      } catch (e) {
        console.error("[Meeting] fetch failed; falling back to sampleProject", e);
        // 실패 시 sample 유지
      }
    })();
  }, [projectId]);

  return (
    <div className="screen">
      <div className="project-view-meeting">
        <div className="layout ProjectViewMeeting">
          <MeetingInfoCard project={project} />
          <MeetingList project={project} />
          <button className="meet-button addfinish">mark as finished</button>
        </div>
        <MemoCard initialMemos={exampleMemos} />
      </div>
    </div>
  );
};

export default ProjectViewMeeting;