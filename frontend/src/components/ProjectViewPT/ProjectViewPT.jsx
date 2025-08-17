// src/components/PT/ProjectViewPT.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { api } from "../../api/client";

import PTInfoCard from "./PTInfoCard";
import PTList from "./PTList";
import MemoCard from "../ProjectView/MemoCard";
import ProfilePic from "../../assets/ProfilePic.png";

import "../ProjectView/ProjectViewDiv.css";

const useQuery = () => new URLSearchParams(useLocation().search);

const toBool = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1") return true;
    if (s === "false" || s === "0") return false;
  }
  if (typeof v === "number") return v === 1;
  return false;
};


const normalize = (payload) => {
  const proj = Array.isArray(payload?.projects) ? payload.projects[0] : null;
  const participants = Array.isArray(payload?.participants) ? payload.participants : [];
  const sessions = Array.isArray(payload?.pt_session) ? payload.pt_session : [];
  const memos = Array.isArray(payload?.memo) ? payload.memo : [];

  return {
    id: proj?.projectId ?? proj?.id ?? null,
    title: proj?.projectName ?? "PT Project",
    description: "",
    category: proj?.category ?? "PT",

    // PTInfoCard expects this:
    users: participants.map((p, i) => ({
      name: p?.name ?? `User ${i + 1}`,
      avatar: p?.profileImage ?? p?.profile_image ?? ProfilePic,
    })),

    // ✅ Keep finalized flags exactly (and normalized)
    _sessionsRaw: sessions.map((s, i) => {
      const finalizedBool = toBool(s?._finalized ?? s?.is_finalized ?? s?.finalized);
      return {
        plannerId: s?.plannerId ?? s?.id ?? String(i + 1),
        title: s?.title ?? `Session ${i + 1}`,
        _finalized: finalizedBool,       // keep original-style key
        is_finalized: finalizedBool,     // also expose snake_case
      };
    }),

    // MemoCard expects this:
    memos: memos.map((m, i) => ({
      id: String(m?.noteId ?? m?.id ?? i + 1),
      type: String(m?.share ?? "PERSONAL").toLowerCase() === "group" ? "group" : "personal",
      project: m?.title ?? "Untitled",
      content: m?.content ?? "",
      category: "pt",
    })),
  };
};

const ProjectViewPT = () => {
  const query = useQuery();
  const params = useParams();
  const projectId = query.get("projectId") || params.projectId || null;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [view, setView] = useState(null);

  const handleFinished = async () => {
  try{
    const res = await api.getSession(
              `/api/pt/inviteUser/${projectId}/finished`
            );
  }
  catch (e){
    console.error(e);
  }
}


  useEffect(() => {
    let alive = true;

    (async () => {
      if (!projectId) {
        setErr("Missing projectId");
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr("");
      try {
        const data = await api.getSession(`/api/pt/project?projectId=${encodeURIComponent(projectId)}`);
        if (!alive) return;
        setView(normalize(data));
      } catch (e) {
        if (!alive) return;
        console.error("Failed to load PT project:", e);
        setErr(e?.message || "Failed to load project");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [projectId]);

  if (loading) return <div className="screen"><div className="project-view-div">Loading…</div></div>;
  if (err) return <div className="screen"><div className="project-view-div" style={{ color: "crimson" }}>{err}</div></div>;
  if (!view) return null;

  return (
    <div className="screen">
      <div className="project-view-div">
        <div className="layout ProjectView">
          <PTInfoCard project={view} />
          <PTList project={view} />

          <button className="meet-button addfinish"
          onClick={handleFinished}
          >mark as finished</button>
        </div>
         <MemoCard
           initialMemos={view.memos}
           key={`memo-${projectId}`}
           projectId={projectId}
           projectName={view.title}  
         />
      </div>
    </div>
  );
};

export default ProjectViewPT;