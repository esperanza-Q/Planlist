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

// Toggle mock quickly if needed
const USE_MOCK = false;

// helpers
const toDate = (d) => {
  if (!d) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = new Date(d);
  return isNaN(dt) ? String(d) : dt.toISOString().slice(0, 10);
};
const toTime = (t) => {
  if (!t || typeof t !== "string") return null;
  const m = t.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : t;
};

// ---- MOCK DATA shaped like your backend ----
const buildMock = (plannerId) => ({
  title: "PT Session A",
  Date: "2025-08-27T10:00:00",
  startTime: "10:00:00",
  endTime: "11:30:00",
  Participants: [
    { name: "sujin01", profile_image: null },
    { name: "Kim", profile_image: null },
  ],
  Comments: [
    { name: "Kim", profile_image: null, role: "TRAINER", content: "Warm-up 10 min." },
    { name: "you", profile_image: null, role: "TRAINEE", content: "Felt good today." },
  ],
  TodayGoal: "Form check on squats; moderate intensity.",
  MyExercises: [
    { exercisePlanId: 1, exerciseName: "Back Squat", time: "10m", sets: 4, type: "DONE" },
    { exercisePlanId: 2, exerciseName: "Hip Thrust", time: "10m", sets: 3, type: "TRAINER_P" },
  ],
  Exercises: [
    { exerciseId: 11, exerciseName: "Back Squat" },
    { exerciseId: 12, exerciseName: "Romanian Deadlift" },
  ],
  _mockMeta: { plannerId },
});

// normalize backend -> UI (handles lowercase keys from API)
// normalize backend -> UI (handles lowercase keys from API & uses real images)
const normalizeSession = (raw, plannerId) => {
  const d = raw ?? {};
  const startDate = toDate(d.date) ?? "TBD";
  const startTime = toTime(d.startTime) ?? "TBD";
  const endTime = d.endTime ? toTime(d.endTime) : "none";

  const project = {
    id: Number(plannerId),
    title: d.title ?? "",
    description:  "  ",
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
          avatar: p?.profileImage || p?.profile_image || DefaultProfilePic,
        }))
      : [],
    meetings: [],
  };

  const comments = Array.isArray(d.comments)
    ? d.comments.map((c, i) => ({
        id: i + 1,
        profilepic: c?.profileImage || c?.profile_image || DefaultProfilePic,
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
    () => new URLSearchParams(search).get("plannerId") ?? "23",
    [search]
  );

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [goal, setGoal] = useState("");
  const [exercises, setExercises] = useState([]);
  const [myExercises, setMyExercises] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const raw = USE_MOCK
          ? buildMock(plannerId)
          : await api.get("/api/pt/session", { params: { sessionId: plannerId } }); // client.js returns data directly

        const norm = normalizeSession(raw, plannerId);
        setProject(norm.project);
        setComments(norm.comments);
        setGoal(norm.goal);
        setExercises(norm.exercises);
        setMyExercises(norm.myExercises);
      } catch (e) {
        console.error("PT session fetch failed; falling back to mock:", e);
        const norm = normalizeSession(buildMock(plannerId), plannerId);
        setProject(norm.project);
        setComments(norm.comments);
        setGoal(norm.goal);
        setExercises(norm.exercises);
        setMyExercises(norm.myExercises);
        setErr("(Using mock data)");
      } finally {
        setLoading(false);
      }
    })();
  }, [plannerId]);

  return (
    <div className="screen">
      <div className="project-view-div detail">
        <div className="layout ProjectViewDiv">
          <PTDetailInfoCard project={project || { users: [] }} />
          <CommentCard initialComments={comments} sessionId={plannerId} />
        </div>

        <div className="layout ProjectViewDiv">
          <PTGoalCard   goal={goal}  sessionId={plannerId}
            onSaved={(g) => setGoal(g)} // optional: keep parent state in sync
          />
          <ExerciseCard
          sessionId={plannerId}
          availableExercises={exercises}    
          initialSelected={myExercises}     />
           
          
        </div>

        {loading && <div style={{ padding: 12 }}>Loading…</div>}
        {err && <div style={{ padding: 12, color: "crimson" }}>{String(err)}</div>}
      </div>
    </div>
  );
};

export default ProjectViewPTDetails;
