import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./ProjectViewTravel.css";

import ViewPlannerCard from "./ViewPlannerCard";
import TravelInfoCard from "./TravelInfoCard";
import TravelMemoCard from "./TravelMemoCard";
import ProfilePic from "../../assets/ProfilePic.png";
import { api } from "../../api/client";



/** Map API response -> TravelInfoCard’s expected shape (based on your sample) */
const toInfoCardModel = (raw) => ({
  id: raw.project_id,
  title: raw.project_name,
  description: raw.description,
  category: "travel",
  status: undefined,          // set if your API has it
  repeat: "none",
  startDate: raw.start_date?.slice(0, 10),
  startTime: raw.start_date?.slice(11, 16),
  endDate: raw.end_date?.slice(0, 10),
  endTime: raw.end_date?.slice(11, 16),
  placeName: raw.location,
  placeAddress: raw.location,
  users: (raw.participants || []).map((p) => ({
    name: p.username,
    avatar: ProfilePic,        // replace with real avatar url if you have it
  })),
  meetings: [],               // fill if you want to show past meetings
});

/** Map API response -> TravelMemoCard’s expected array shape */
const toMemoList = (raw) => {
  const content = raw?.teamMemo?.content;
  return content
    ? [
        {
          id: String(raw.project_id),
          type: "group",
          project: raw.project_name,
          content,
          category: "travel",
        },
      ]
    : [];
};

const ProjectViewTravel = () => {
    const { projectId: paramProjectId, project_id } = useParams();
    const location = useLocation();
    const projectId = paramProjectId ?? project_id ?? location.state?.projectId ?? null;
      const params = useParams();
  // read /:project_id from route, fallback to a value for local testing

  const [trip, setTrip] = useState(null);     // whole API payload (for ViewPlannerCard)
  const [info, setInfo] = useState(null);     // mapped for TravelInfoCard
  const [memos, setMemos] = useState([]);     // mapped for TravelMemoCard
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const raw = await api.getSession(`/api/travel/info/${projectId}`);
        if (!alive) return;
        setTrip(raw);                     // ViewPlannerCard expects the original snake_case shape
        setInfo(toInfoCardModel(raw));    // TravelInfoCard mapped model
        setMemos(toMemoList(raw));        // TravelMemoCard initial memos
      } catch (e) {
        if (!alive) return;
        console.error("Failed to load travel info:", e);
        setErr(e.message || "Failed to load travel info");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="screen">
        <div className="project-view-div">
          <div style={{ padding: 16 }}>Loading travel info…</div>
        </div>
      </div>
    );
  }

  if (err || !trip) {
    return (
      <div className="screen">
        <div className="project-view-div">
          <div style={{ padding: 16, color: "crimson" }}>
            {err || "No data"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="project-view-div">
        <div className="layout">
          <TravelInfoCard project={info} />
          <TravelMemoCard initialMemos={memos} />
        </div>
        <ViewPlannerCard project={trip} />
      </div>
    </div>
  );
};

export default ProjectViewTravel;
