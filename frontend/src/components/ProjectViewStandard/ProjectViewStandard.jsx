// src/pages/ProjectView/ProjectViewStandard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { api } from "../../api/client";

import MemoCard from "../../components/ProjectView/MemoCard";
import StandardInfoCard from "../../components/ProjectViewStandard/StandardInfoCard";
import StandardList from "../../components/ProjectViewStandard/StandardList";
import "./ProjectViewStandard.css";

import ProfilePic from "../../assets/ProfilePic.png";

// ---- fallback samples (used if fetch fails) ----
const sampleProject = {
  id: 1,
  title: "Team Branding Workshop",
  description: "Seoul HQ · Main hall",
  category: "standard",
  status: "Active",
  repeat: "none",
  startDate: "2025-07-01",
  endDate: "2025-07-01",
  users: [
    { name: "A", avatar: ProfilePic },
    { name: "B", avatar: ProfilePic },
    { name: "C", avatar: ProfilePic },
  ],
  meetings: [], // sessions list
};

const exampleMemos = [
  { id: "pm", type: "personal", project: "example project", content: "개인 메모 예시", category: "standard" },
  { id: "gm", type: "group",    project: "example project", content: "그룹 메모 예시", category: "standard" },
];

// ---- helpers ----
const normalizeRepeat = (rep) => {
  if (!rep) return "none";
  if (typeof rep === "string") return rep;
  const t = rep.type ?? "none";
  const c = rep.count ? ` x${rep.count}` : "";
  return `${t}${c}`;
};

const buildDescription = (loc) => {
  if (!loc) return "";
  const a = [loc.place_name, loc.address, loc.placeName, loc.place_address]
    .filter(Boolean)
    .join(" · ");
  return a || "";
};

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

// Map **project** response -> StandardInfoCard + MemoCard + sessions list
const normalizeStandardProject = (raw) => {
  const root = raw?.data ?? raw ?? {};

  // project object (support both array & single)
  const projObj = Array.isArray(root.projects) ? root.projects[0] : (root.project ?? {});

  const projectId = projObj?.projectId ?? projObj?.id ?? root?.projectId ?? null;
  const title =
    projObj?.projectName ?? projObj?.title ?? root?.title ?? "Untitled Standard Project";
  const category =
    (projObj?.category ?? root?.category ?? "STANDARD").toString().toLowerCase();
  const status = projObj?.status ?? root?.status ?? "Active";
  const startDate = projObj?.startDate ?? projObj?.start_date ?? root?.startDate ?? null;
  const endDate = projObj?.endDate ?? projObj?.end_date ?? root?.endDate ?? startDate;

  const repeat = normalizeRepeat(projObj?.repeat ?? root?.repeat);
  const description = buildDescription(root?.location);

  const users = Array.isArray(root.participants)
    ? root.participants.map((p, i) => ({
        name: p?.name ?? `Member ${i + 1}`,
        avatar: p?.profileImage ?? p?.profile_image ?? ProfilePic,
      }))
    : [];

  // ---- sessions (make it like Meeting/PT)
  // prefer standard-specific key, but be defensive:
  const sessionsRaw =
    (Array.isArray(root.standard_session) && root.standard_session) ||
    (Array.isArray(root.sessions) && root.sessions) ||
    (Array.isArray(root.meeting_session) && root.meeting_session) || // just in case
    [];

  const meetings = sessionsRaw.map((s, i) => ({
    id: s?.plannerId ?? s?.id ?? `s-${i}`,
    plannerId: s?.plannerId ?? s?.id ?? `s-${i}`,
    title: s?.title ?? `session ${i + 1}`,
    finalized: toBool(s?._finalized ?? s?.finalized ?? s?.is_finalized),
  }));

  // ---- memos
  let memos = [];
  if (Array.isArray(root.memo)) {
    memos = root.memo.map((m, i) => ({
      id: String(m?.noteId ?? m?.id ?? i + 1),
      type: String(m?.share ?? "PERSONAL").toLowerCase() === "group" ? "group" : "personal",
      project: title,
      content: m?.content ?? "",
      category: "standard",
    }));
  } else {
    if (root?.personal_memo) {
      memos.push({
        id: "personal",
        type: "personal",
        project: title,
        content: root.personal_memo,
        category: "standard",
      });
    }
    if (root?.group_memo) {
      memos.push({
        id: "group",
        type: "group",
        project: title,
        content: root.group_memo,
        category: "standard",
      });
    }
  }

  return {
    project: {
      id: projectId,
      title,
      description,
      category,
      status,
      repeat,
      startDate,
      endDate,
      users,
      meetings, // ← sessions list used by StandardList
    },
    memos,
  };
};

const ProjectViewStandard = () => {
  const { search } = useLocation();
  const { projectId: routeProjectId } = useParams(); // allow /project/:projectId fallback
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  // Accept projectId from query or route
  const projectId = qs.get("projectId") || routeProjectId || null;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [project, setProject] = useState(sampleProject);
  const [memos, setMemos] = useState(exampleMemos);

  const handleFinished = async () => {
    try {
      await api.getSession(`/api/standard/inviteUser/${projectId}/finished`);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        if (!projectId) {
          throw new Error("Missing projectId");
        }
        const url = `/api/standard/project/${encodeURIComponent(projectId)}`;
        console.log("[Standard] GET →", url);
        const res = await (api.getSession ? api.getSession(url) : api.get(url));
        console.log("[Standard] response ←", res);

        const { project: p, memos: m } = normalizeStandardProject(res || {});
        if (!cancelled) {
          setProject((prev) => ({ ...prev, ...p }));
          setMemos(m.length ? m : []);
        }
      } catch (e) {
        console.error("Standard project fetch failed:", e);
        if (!cancelled) {
          setErr("Failed to load. Showing sample data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [projectId]);

  return (
    <div className="screen">
      <div className="layout-standard">
        <div>
          <StandardInfoCard project={project} />
          <StandardList project={project} />
          <button className="meet-button addfinish" onClick={handleFinished}>
            mark as finished
          </button>
        </div>
        <MemoCard initialMemos={memos} />
      </div>

      {loading && <div style={{ padding: 12, opacity: 0.7 }}>Loading…</div>}
      {err && <div style={{ padding: 12, color: "crimson" }}>{err}</div>}
    </div>
  );
};

export default ProjectViewStandard;
