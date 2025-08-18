import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { api } from "../../api/client";

import MemoCard from "../../components/ProjectView/MemoCard";
import StandardInfoCard from "../../components/ProjectViewStandard/StandardInfoCard";
import "./ProjectViewStandard.css";

import ProfilePic from "../../assets/ProfilePic.png";

// Fallback sample (kept in case of errors)
const sampleProject = {
  id: 1,
  title: "Team Branding Workshop",
  description: "Weekly catch-up and planning meeting.",
  category: "standard",
  status: "Active",
  repeat: "weekly",
  startDate: "2025-07-01",
  endDate: "2025-07-07",
  users: [
    { name: "A", avatar: ProfilePic },
    { name: "B", avatar: ProfilePic },
    { name: "C", avatar: ProfilePic },
  ],
  meetings: ["meeting1", "meeting2"],
};

const exampleMemos = [
  {
    id: "pm",
    type: "personal",
    project: "example project",
    content: "개인 메모 예시",
    category: "standard",
  },
  {
    id: "gm",
    type: "group",
    project: "example project",
    content: "그룹 메모 예시",
    category: "standard",
  },
];

// --- helpers to normalize the backend payload -> UI props ---
const normalizeRepeat = (rep) => {
  if (!rep) return "none";
  const t = rep.type ?? "none";
  const c = rep.count ? ` x${rep.count}` : "";
  return `${t}${c}`;
};

const buildDescription = (loc) => {
  if (!loc) return "";
  const a = [loc.place_name, loc.address].filter(Boolean).join(" · ");
  return a || "";
};

const normalizeStandard = (raw) => {
  const proj = {
    id: raw?.planner_id ?? raw?.plannerId ?? null,
    title: raw?.title ?? "",
    description: buildDescription(raw?.location),
    category: "standard",
    status: "Active",
    repeat: normalizeRepeat(raw?.repeat),
    startDate: raw?.start_date ?? raw?.start_week_date ?? "",
    endDate: raw?.start_week_date ?? raw?.start_date ?? "",
    users: Array.isArray(raw?.participants)
      ? raw.participants.map((p) => ({
          name: p?.name ?? "",
          avatar: ProfilePic, // no image in payload; use a default
        }))
      : [],
    meetings: Array.isArray(raw?.references)
      ? raw.references
          .map((r) => r?.filename || r?.url)
          .filter(Boolean)
          .slice(0, 8)
      : [],
  };

  const memos = [];
  if (raw?.personal_memo) {
    memos.push({
      id: "personal",
      type: "personal",
      project: proj.title || "project",
      content: raw.personal_memo,
      category: "standard",
    });
  }
  if (raw?.group_memo) {
    memos.push({
      id: "group",
      type: "group",
      project: proj.title || "project",
      content: raw.group_memo,
      category: "standard",
    });
  }

  return { project: proj, memos };
};

const ProjectViewStandard = () => {
  const { search } = useLocation();
  const { projectId: routeId } = useParams(); // supports /project/:projectId
  const params = useMemo(() => new URLSearchParams(search), [search]);

  // Accept planner id from multiple shapes: /project/:projectId OR ?projectId= OR ?plannerId=
  const plannerId =
    routeId ||
    params.get("projectId") ||
    params.get("plannerId") ||
    null;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [project, setProject] = useState(sampleProject);
  const [memos, setMemos] = useState(exampleMemos);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        if (!plannerId) {
          throw new Error("Missing plannerId");
        }
        // GET /api/standard/{planner_id}
        const res = await api.getsE(`/api/standard/${encodeURIComponent(plannerId)}`);
        const { project: p, memos: m } = normalizeStandard(res || {});
        if (!cancelled) {
          setProject((prev) => ({ ...prev, ...p }));
          setMemos(m.length ? m : []);
        }
      } catch (e) {
        console.error("Standard project fetch failed:", e);
        if (!cancelled) {
          setErr("Failed to load. Showing sample data.");
          // keep the existing sampleProject & exampleMemos
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [plannerId]);

  return (
    <div className="screen">
      <div className="layout-standard">
        <div>
          <StandardInfoCard project={project} />
            <button className="meet-button addfinish"
            // onClick={handleFinished}
            >mark as finished</button>
        </div>
        <MemoCard initialMemos={memos} />
      </div>

      {loading && (
        <div style={{ padding: 12, opacity: 0.7 }}>Loading…</div>
      )}
      {err && (
        <div style={{ padding: 12, color: "crimson" }}>{err}</div>
      )}
    </div>
  );
};

export default ProjectViewStandard;
