// src/components/PT/ProjectViewPTDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../api/client";

import "../ProjectView/ProjectViewDiv.css";
import "./ProjectViewPT.css";

import PTDetailInfoCard from "./PTDetailInfoCard";
import CommentCard from "./CommentCard";
import PTGoalCard from "./PTGoalCard";
import ExerciseCard from "./ExerciseCard";

import DefaultProfilePic from "../../assets/ProfilePic.png";

// helpers
const toDate = (d) => {
  if (!d) return null;
  // accept "YYYY-MM-DD" or any parsable ISO/date string
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = new Date(d);
  return isNaN(dt) ? String(d) : dt.toISOString().slice(0, 10);
};
const toTime = (t) => {
  if (!t || typeof t !== "string") return null;
  const m = t.match(/^(\d{2}):(\d{2})/); // "HH:mm:ss" -> "HH:mm"
  return m ? `${m[1]}:${m[2]}` : t;
};



// normalize backend -> UI
const normalizeSession = (raw, plannerId) => {
  const d = raw ?? {};
  const startDate = toDate(d.date) ?? "TBD";
  const startTime = toTime(d.startTime) ?? "TBD";
  const endTime = d.endTime ? toTime(d.endTime) : "none";

  const project = {
    id: Number(plannerId),
    title: d.title ?? "",
    description: d.todayGoal ?? "",  // show goal under the title
    category: "pt",
    status: "Active",
    repeat: "none",
    startDate,
    startTime,
    endTime,
    endDate: "none",
    placeName: "",
    placeAddress: "",
    users: Array.isArray(d.participants)
      ? d.participants.map((p, i) => ({
          name: p?.name ?? `Member ${i + 1}`,
          avatar: p?.profileImage || DefaultProfilePic,
        }))
      : [],
    meetings: [],
  };

  const comments = Array.isArray(d.comments)
    ? d.comments.map((c, i) => ({
        id: i + 1,
        profilepic: c?.profile_image || DefaultProfilePic,
        user: c?.name ?? "user",
        text: c?.content ?? "",
        isTrainer: String(c?.role).toUpperCase() === "TRAINER",
      }))
    : [];

  const goal = d.todayGoal ?? "";
  const exercises = Array.isArray(d.exercises) ? d.exercises : [];
  const myExercises = Array.isArray(d.myExercises) ? d.myExercises : [];

  return { project, comments, goal, exercises, myExercises };
};

const ProjectViewPTDetails = () => {
  const { search } = useLocation();
  const plannerId = useMemo(
    () => new URLSearchParams(search).get("plannerId"),
    [search]
  );

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // children props
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [goal, setGoal] = useState("");
  const [exercises, setExercises] = useState([]);
  const [myExercises, setMyExercises] = useState([]);

  useEffect(() => {
    if (!plannerId) {
      setErr("Missing plannerId in URL");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await api.get("/api/pt/session", {
          params: { sessionId: plannerId },
        });

        // debug: verify raw data and normalized data
        console.debug("[PT] raw session:", res.data);
        const { project, comments, goal, exercises, myExercises } =
          normalizeSession(res.data, plannerId);

        
        console.debug("[PT] normalized project for PTDetailInfoCard:", project);

        setProject(project);
        setComments(comments);
        setGoal(goal);
        setExercises(exercises);
        setMyExercises(myExercises);
      } catch (e) {
        console.error("Failed to fetch PT session:", e);
        setErr("Session load failed.");
      } finally {
        setLoading(false);
      }
    })();
  }, [plannerId]);

  return (
    <div className="screen">
      <div className="project-view-div detail">
        <div className="layout ProjectViewDiv">
          {/* 🔑 Pass the normalized `project` prop */}
          <PTDetailInfoCard project={project || { users: [] }} />
          <CommentCard initialComments={comments} />
        </div>

        <div className="layout ProjectViewDiv">
          <PTGoalCard goal={goal} />
          <ExerciseCard exercises={exercises} myExercises={myExercises} />
        </div>

        {loading && <div style={{ padding: 12 }}>Loading…</div>}
        {err && (
          <div style={{ padding: 12, color: "crimson" }}>
            {err}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectViewPTDetails;
