// src/pages/ProjectView/ProjectViewMeeting.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../api/client";

import MeetingInfoCard from "../../components/ProjectViewMeeting/MeetingInfoCard";
import MeetingList from "../../components/ProjectViewMeeting/MeetingList";
import MemoCard from "../ProjectView/MemoCard";
import "./ProjectViewMeeting.css";

import ProfilePic from "../../assets/ProfilePic.png";

const sampleProject = {
  id: null,
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
// 서버 응답(예시):
// {
//   participants:[{name,profileImage}], memo:[],
//   meeting_session:[{plannerId,title,_finalized}],
//   projects:[{projectId,projectName,category,status,startDate,endDate,confirmedAt}]
// }
const normalizeProject = (raw) => {
  const root = raw?.data ?? raw ?? {};
  const proj = Array.isArray(root.projects) ? root.projects[0] : (root.project ?? {});

  const id        = proj?.projectId ?? proj?.id ?? null;
  const title     = proj?.projectName ?? proj?.title ?? proj?.name ?? "Untitled Meeting Project";
  const category  = (proj?.category ?? "MEETING").toString().toLowerCase(); // "meeting"
  const status    = proj?.status ?? "INPROGRESS";
  const startDate = proj?.startDate ?? null;
  const endDate   = proj?.endDate ?? null;

  const users = Array.isArray(root.participants)
    ? root.participants.map((p, i) => ({
        name: p?.name ?? `Member ${i +  1}`,
        avatar: p?.profileImage ?? p?.profile_image ?? ProfilePic,
      }))
   : [];

  // meeting_session → meetings(객체 배열)
  const meetings = Array.isArray(root.meeting_session)
    ? root.meeting_session.map((s, i) => ({
        id: s?.plannerId ?? s?.id ?? `s-${i}`,
        plannerId: s?.plannerId ?? s?.id ?? `s-${i}`,
        title: s?.title ?? `meeting ${i + 1}`,
        finalized: Boolean(s?._finalized ?? s?.finalized ?? false),
      }))
    : [];
  

  return {
    id,
    title,
    description: "",
    category,
    status,
    repeat: "none",
    startDate,
    endDate,
    users,
   meetings,
  };
};


const ProjectViewMeeting = () => {
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const projectId = query.get("projectId");

  const [project, setProject] = useState(sampleProject);
  const [memoScope, setMemoScope] = useState({ projectId: null, projectName: undefined });

   const handleFinished = async () => {
    try{
      const res = await api.getSession(
                `/api/meeting/inviteUser/${projectId}/finished`
              );
    }
    catch (e){
      console.error(e);
    }
  }
  

  const effectiveProjectName = useMemo(() => {
  // 서버가 준 project.id가 라우트 projectId와 정확히 일치할 때만 이름 필터 사용
  const fromServerId = project?.id;
  if (fromServerId == null) return undefined;
  if (String(fromServerId) !== String(projectId)) return undefined;
  return project?.title || undefined;
}, [project?.id, project?.title, projectId]);

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
        setProject(normalized); 
      } catch (e) {
        console.error("[Meeting] fetch failed; falling back to sampleProject", e);
        // 실패 시 sample 유지
      }
    })();
  }, [projectId]);

  const readyForMemo = useMemo(() => {
    if (!projectId) return false;
    if (project?.id == null) return false;             // 서버 응답 전
    if (String(project.id) !== String(projectId)) return false; // 다른 프로젝트 데이터
    if (!project?.title) return false;                 // 이름 필터용 제목 없음
    return true;
  }, [projectId, project?.id, project?.title]);

   useEffect(() => {
    setMemoScope({ projectId: null, projectName: undefined });
  }, [projectId]);
  
  // ✅ 서버 응답이 라우트와 일치하면, 그때 단 한 번 스코프 확정
  useEffect(() => {
    const serverId = project?.id;
    const name = project?.title;
    if (!projectId || serverId == null || String(serverId) !== String(projectId) || !name) return;
    setMemoScope(prev =>
      prev.projectId === projectId && prev.projectName ? prev : { projectId, projectName: name }
    );
 }, [projectId, project?.id, project?.title]);

 const EMPTY_MEMOS = useRef([]).current;


  return (
    <div className="screen">
      <div className="project-view-meeting">
        <div className="layout ProjectViewMeeting">
          <MeetingInfoCard project={project} />
          <MeetingList project={project} />
          <button className="meet-button addfinish"
            onClick={handleFinished}
          >
            mark as finished</button>
        </div>
             {memoScope.projectId && (
          <MemoCard
            projectId={memoScope.projectId}
            projectName={memoScope.projectName}
            initialMemos={EMPTY_MEMOS}   
            key={`memo-meeting-${memoScope.projectId}`}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectViewMeeting;