// src/components/PT/WorkoutPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import { api } from "../../api/client";
import AddExercisePopup from "./AddExercisePopup";
import x_circle from "../../assets/x_circle.svg";

/** Map server exercise types list -> { id, name } */
const mapServerExercise = (ex, i) => ({
  id: ex?.exerciseId ?? ex?.id ?? i + 1,
  name: ex?.exerciseName ?? ex?.name ?? `Exercise ${i + 1}`,
});

/** Map myExercises (already added) -> internal selected list */
const mapMyExercise = (ex, i) => ({
  id: ex?.exercisePlanId ?? ex?.id ?? i + 1, // <-- exercisePlanId used for DELETE
  name: ex?.exercisePlanName ?? ex?.exerciseName ?? ex?.name ?? `Exercise ${i + 1}`,
  sets: Number(ex?.sets ?? 0),
  time: Number(ex?.time ?? 0),
  role: String(ex?.type ?? ex?.role ?? "").toUpperCase(), // "DONE" | "TRAINER_P"
});

const roleOf = (ex) => String(ex?.role ?? ex?.type ?? "").toUpperCase();

const WorkoutPage = ({ sessionId, availableExercises = [], initialSelected = [] }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [activeTab, setActiveTab] = useState("done"); // "done" | "trainer"
  const [saving, setSaving] = useState(false);
  const [deletingIds, setDeletingIds] = useState(() => new Set());

  // Prefer server list; fallback to a small default
  const exerciseList = useMemo(() => {
    const srv = (availableExercises || []).map(mapServerExercise);
    return srv.length
      ? srv
      : [
          { id: 1, name: "Push Ups" },
          { id: 2, name: "Squats" },
          { id: 3, name: "Plank" },
          { id: 4, name: "Jumping Jacks" },
        ];
  }, [availableExercises]);

  // Prefill from myExercises on load/prop change
  useEffect(() => {
    setSelectedExercises((initialSelected || []).map(mapMyExercise));
  }, [initialSelected]);

  // Split by role for tabs
  const doneList = useMemo(
    () => selectedExercises.filter((ex) => roleOf(ex) === "DONE"),
    [selectedExercises]
  );
  const trainerList = useMemo(
    () => selectedExercises.filter((ex) => roleOf(ex) === "TRAINER_P"),
    [selectedExercises]
  );

  const apiType = activeTab === "trainer" ? "TRAINER_P" : "DONE";

  const handleApiSave = async ({ exerciseId, name, sets, time }) => {
    if (!sessionId) {
      alert("Missing sessionId for API call.");
      return;
    }
    if (saving) return;

    setSaving(true);
    try {
      const res = await api.post(
        `/api/pt/session/addExercise?sessionId=${encodeURIComponent(
          sessionId
        )}&type=${encodeURIComponent(apiType)}`,
        {
          exerciseId,
          time: Number(time),
          sets: Number(sets),
        }
      );
      // Response: { exercisePlanId, exercisePlanName, time, sets, role }
      const added = {
        id: res?.exercisePlanId ?? exerciseId, // <-- this ID is used for deletion
        name: res?.exercisePlanName ?? name,
        sets: Number(res?.sets ?? sets),
        time: Number(res?.time ?? time),
        role: String(res?.role ?? apiType).toUpperCase(),
      };
      setSelectedExercises((prev) => [...prev, added]);
      setShowPopup(false);
    } catch (e) {
      alert(e?.message || "운동 추가에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    // optimistic remove
    const prev = selectedExercises;
    setSelectedExercises((cur) => cur.filter((ex) => ex.id !== id));
    setDeletingIds((cur) => new Set(cur).add(id));

    try {
      // DELETE /api/pt/session/deleteExercise/{exercisePlanId}
      await api.delete(`/api/pt/session/deleteExercise/${encodeURIComponent(id)}`);
      // success: 204 No Content or 200 OK (string) – nothing else to do
    } catch (e) {
      // rollback on failure
      setSelectedExercises(prev);
      alert(e?.message || "운동 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeletingIds((cur) => {
        const next = new Set(cur);
        next.delete(id);
        return next;
      });
    }
  };

  const renderList = (list, emptyText) => (
    <ul className="exercise-list">
      {list.length === 0 ? (
        <li>{emptyText}</li>
      ) : (
        list.map((ex) => {
          const isDeleting = deletingIds.has(ex.id);
          return (
            <li className="exercise-item" key={ex.id}>
              <span className="exercise-title">{ex.name} </span>
              <span>
                <div>
                  {ex.sets} sets {ex.time} min{" "}
                 </div>
              </span>
              <button
                onClick={() => handleDelete(ex.id)}
                style={{ marginLeft: "10px", color: isDeleting ? "#888" : "red" }}
                aria-label="delete exercise"
                title={isDeleting ? "Deleting..." : "Remove"}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : <img src={x_circle} alt="remove" />}
              </button>
            </li>
          );
        })
      )}
    </ul>
  );

  return (
    <div>
      {showPopup && (
        <AddExercisePopup
          exercises={exerciseList}      // normalized {id,name}
          onSave={handleApiSave}
          onClose={() => setShowPopup(false)}
          saving={saving}
        />
      )}

      {/* Tabs */}
      <div className="tab exercise-card-tab" style={{ marginBottom: "1rem" }}>
        <button onClick={() => setActiveTab("trainer")} disabled={activeTab === "trainer"}>
          Trainer&apos;s Pick
        </button>
        <button onClick={() => setActiveTab("done")} disabled={activeTab === "done"}>
          Done
        </button>
      </div>

      {/* Content per tab */}
      {activeTab === "done"
        ? renderList(doneList, "No exercises done yet")
        : renderList(trainerList, "No trainer picks yet")}

      <button className="add-sets" onClick={() => setShowPopup(true)} disabled={saving}>
        {saving ? "Saving..." : " Add Sets"}
      </button>
    </div>
  );
};

export default WorkoutPage;
