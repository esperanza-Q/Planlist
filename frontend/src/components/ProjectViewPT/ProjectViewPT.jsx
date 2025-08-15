import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { api } from "../../api/client";

import PTInfoCard from "./PTInfoCard";
import PTList from "./PTList";
import MemoCard from "../ProjectView/MemoCard";
import ProfilePic from "../../assets/ProfilePic.png";

import "../ProjectView/ProjectViewDiv.css";

const useQuery = () => new URLSearchParams(useLocation().search);

const normalize = (payload) => {
  const proj = Array.isArray(payload?.projects) ? payload.projects[0] : null;
  const participants = Array.isArray(payload?.participants) ? payload.participants : [];
  const sessions = Array.isArray(payload?.pt_session) ? payload.pt_session : [];
  const memos = Array.isArray(payload?.memo) ? payload.memo : [];

  return {
    id: proj?.projectId ?? proj?.id ?? null,
    title: proj?.projectName ?? "PT Project",
    description: "", // none from API
    category: proj?.category ?? "PT",

    // What PTInfoCard expects
    users: participants.map((p, i) => ({
      name: p?.name ?? `User ${i + 1}`,
      avatar: p?.profileImage ?? p?.profile_image ?? ProfilePic,
    })),

    // What PTList expects
    _sessionsRaw: sessions.map((s, i) => ({
      plannerId: s?.plannerId ?? s?.id ?? String(i + 1),
      title: s?.title ?? `Session ${i + 1}`,
      is_finalized: !!(s?.is_finalized ?? s?.finalized),
    })),

    // What MemoCard expects
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
        </div>
        <MemoCard initialMemos={view.memos} />
      </div>
    </div>
  );
};

export default ProjectViewPT;
