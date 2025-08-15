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

// ----------------------------------------------------
// Toggle this flag to switch between mock/API
// ----------------------------------------------------
const USE_MOCK = true;

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

// ---- MOCK DATA (kept close to your backend shape) ----
const buildMock = (plannerId) => ({
  // backend-style keys the normalizer expects
  date: "2025-08-27",
  startTime: "10:00:00",
  endTime: "11:30:00",
  title: "PT Session A",
  todayGoal: "Form check on squats; moderate intensity.",
  participants: [
    { name: "sujin01", profileImage: null },
    { name: "Kim", profileImage: null },
  ],
  comments: [
    {
      name: " Kim",
      role: "TRAINER",
      profile_image: null,
      content: "Warm up 10 min + mobility. Keep core tight.",
    },
    {
      name: "you",
      role: "MEMBER",
      profile_image: null,
      content: "Felt good today. Knees tracked better.",
    },
  ],
  exercises: [
    { name: "Back Squat", sets: 4, reps: "6–8", weight: "40–50kg" },
    { name: "Romanian Deadlift", sets: 3, reps: 8, weight: "30–40kg" },
  ],
  myExercises: [
    { name: "Back Squat", sets: [8, 8, 7, 6], weights: ["40", "42.5", "45", "45"] },
    { name: "Hip Thrust", sets: [12, 12, 12], weights: ["35", "35", "35"] },
  ],
  _mockMeta: { plannerId },
});

// normalize backend -> UI
const normalizeSession = (raw, plannerId) => {
  const d = raw ?? {};
  const startDate = toDate(d.date) ?? "TBD";
  const startTime = toTime(d.startTime) ?? "TBD";
  const endTime = d.endTime ? toTime(d.endTime) : "none";

  // Force ALL avatars to DefaultProfilePic
  const project = {
    id: Number(plannerId),
    title: d.title ?? "",
    description: d.todayGoal ?? "",
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
          avatar: DefaultProfilePic, // force default
        }))
      : [],
    meetings: [],
  };

  const comments = Array.isArray(d.comments)
    ? d.comments.map((c, i) => ({
        id: i + 1,
        profilepic: DefaultProfilePic, // force default
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

  // children props
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [goal, setGoal] = useState("");
  const [exercises, setExercises] = useState([]);
  const [myExercises, setMyExercises] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      // If using mock: skip API and load immediately
      if (USE_MOCK) {
        const mock = buildMock(plannerId);
        const norm = normalizeSession(mock, plannerId);
        setProject(norm.project);
        setComments(norm.comments);
        setGoal(norm.goal);
        setExercises(norm.exercises);
        setMyExercises(norm.myExercises);
        setLoading(false);
        return;
      }

      // Otherwise try real API, but fall back to mock on error
      try {
        const res = await api.get("/api/pt/session", {
          params: { sessionId: plannerId },
        });

        console.debug("[PT] raw session:", res.data);
        const norm = normalizeSession(res.data, plannerId);
        console.debug("[PT] normalized project for PTDetailInfoCard:", norm.project);

        setProject(norm.project);
        setComments(norm.comments);
        setGoal(norm.goal);
        setExercises(norm.exercises);
        setMyExercises(norm.myExercises);
      } catch (e) {
        console.error("Failed to fetch PT session, falling back to mock:", e);
        const mock = buildMock(plannerId);
        const norm = normalizeSession(mock, plannerId);
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
          <CommentCard initialComments={comments} />
        </div>

        <div className="layout ProjectViewDiv">
          <PTGoalCard goal={goal} />
          <ExerciseCard exercises={exercises} myExercises={myExercises} />
        </div>

        {loading && <div style={{ padding: 12 }}>Loading…</div>}
        {err && (
          <div style={{ padding: 12, color: "crimson" }}>
            {String(err)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectViewPTDetails;
