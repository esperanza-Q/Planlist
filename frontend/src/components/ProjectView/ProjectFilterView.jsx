import React, { useEffect, useState } from 'react';
import ProjectViewItem from './ProjectViewItem';
import { Link } from "react-router-dom";
import addIcon from "../../assets/add-icon.svg";
import DefaultProfilePic from "../../assets/ProfilePic.png";
import { api } from "../../api/client";

// ---------- helpers ----------
const toUiStatus = (s) => {
  const m = {
    INPROGRESS: "In progress",
    IN_PROGRESS: "In progress",
    UPCOMING: "Upcoming",
    FINISHED: "Finished",
  };
  return m[(s || "").toUpperCase()] || "Unknown";
};

// Map any backend category label to the exact tokens your router uses
const toUiCategory = (c) => {
  const v = (c || "").toLowerCase().trim();
  if (v === "pt" || c === "PT") return "PT";          // keep PT uppercase for your switch
  if (v === "travel") return "travel";
  if (v === "meeting") return "meeting";
  if (v === "standard") return "standard";
  // try a few likely capitalized labels
  if (v === "project" || v === "default") return "standard";
  return "standard";
};

const safeDate = (d) => (d ? new Date(d) : null);

// Accepts array or objects like {projects:[...]} or {data:[...]} or {content:[...]}
const pickArray = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.projects)) return raw.projects;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.content)) return raw.content;
  return [];
};

// Normalize API -> exactly what ProjectViewItem needs
const normalizeProjects = (raw) => {
  const arr = pickArray(raw);

  return arr.map((p, i) => {
    const start = safeDate(p?.startDate) || safeDate(p?.createdAt);
    const users = Array.isArray(p?.participants)
      ? p.participants.map((part, j) => ({
          name: (part?.name || "").trim() || `Participant ${j + 1}`,
          avatar: part?.profileImage || DefaultProfilePic,   // <-- match ProjectViewItem
        }))
      : [];

    return {
      // IDs / titles in the shape the item uses
      id: p?.projectId ?? p?.id ?? `unknown-${i}`,
      title: p?.projectTitle ?? p?.title ?? "Untitled Project",

      // category token for routing + label display
      category: toUiCategory(p?.category),

      // UI status used for filter & badge
      status: toUiStatus(p?.status),

      // dates (strings are fine for display)
      startDate: p?.startDate ?? null,
      endDate: p?.endDate ?? null,

      // extra fields we don't render but might use
      createdAt: p?.createdAt ?? null,
      confirmedAt: p?.confirmedAt ?? null,

      // sorting helper
      sortStart: start ? start.getTime() : Number.MAX_SAFE_INTEGER,

      // users for avatars row
      users,
    };
  });
};

const ProjectFilterView = () => {
  const [filter, setFilter] = useState('all'); // 'all' | 'In progress' | 'Upcoming' | 'Finished'
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [debug, setDebug] = useState({ error: "", rawSnippet: "", http: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let json;
        try {
          json = await api.getSession("/api/projects"); // your client should set credentials: 'include'
        } catch (e) {
          // raw fallback with visibility
          const res = await fetch("/api/projects", { credentials: "include" });
          const text = await res.text();
          if (!res.ok) {
            const snippet = text.slice(0, 300);
            setDebug({ error: `HTTP ${res.status}`, rawSnippet: snippet, http: `HTTP ${res.status}` });
            throw new Error(`HTTP ${res.status}: ${snippet}`);
          }
          try { json = JSON.parse(text); }
          catch {
            const snippet = text.slice(0, 300);
            setDebug({ error: "Response is not JSON", rawSnippet: snippet, http: "HTTP 200" });
            throw new Error("Response was not JSON");
          }
        }

        const normalized = normalizeProjects(json);
        if (alive) setProjects(normalized);
      } catch (e) {
        console.error("Error fetching projects:", e);
        if (alive && !debug.error) {
          setDebug((d) => ({ ...d, error: e?.message || String(e) }));
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // filtering + sorting
  const filteredProjects = projects
    .filter((p) => (filter === 'all' ? true : p.status === filter))
    .sort((a, b) => {
      // push Finished to bottom
      if (a.status === "Finished" && b.status !== "Finished") return 1;
      if (a.status !== "Finished" && b.status === "Finished") return -1;
      return a.sortStart - b.sortStart;
    });

  return (
    <div className='homeContainer'>

      {/* Header / Filters */}
      <div className="buttons">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('In progress')}>
          <div className="circle red" />
          In progress
        </button>
        <button onClick={() => setFilter('Upcoming')}>
          <div className="circle green" />
          Upcoming
        </button>
        <button onClick={() => setFilter('Finished')}>
          <div className="circle" />
          Finished
        </button>

        <div className='addProject'>
          <img src={addIcon} alt="Add" />
          <Link to="/project/create">Create project</Link>
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="project-loading">Loading…</div>}

      {/* Error / Debug visibility */}
      {!loading && debug.error && (
        <div className="project-error" style={{marginTop: 12, color: 'crimson', whiteSpace: 'pre-wrap'}}>
          <strong>Fetch error:</strong> {debug.error}
          {debug.rawSnippet && (
            <>
              {"\n"}<em>Response preview:</em>{"\n"}{debug.rawSnippet}
            </>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && !debug.error && filteredProjects.length === 0 && (
        <div className="project-empty" style={{marginTop: 12}}>
          No projects to show{filter !== 'all' ? ` for "${filter}"` : ""}.
        </div>
      )}

      {/* List */}
      <div className="project-list">
        {filteredProjects.map((project) => (
          <ProjectViewItem key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectFilterView;
