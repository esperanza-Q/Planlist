// src/components/PT/PTGoalCard.jsx
import React, { useEffect, useState } from "react";
import { api } from "../../api/client";

const PTGoalCard = ({
  initialGoal = "Enter your PT goal here.",
  goal: goalProp,                 // backward-compat: some parents pass `goal`
  sessionId,                      // REQUIRED to save
  onSaved,                        // optional callback(newGoal)
}) => {
  const starting = goalProp ?? initialGoal ?? "";
  const [goal, setGoal] = useState(starting);
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(starting);
  const [saving, setSaving] = useState(false);

  // keep in sync when parent updates the goal prop
  useEffect(() => {
    const next = goalProp ?? initialGoal ?? "";
    setGoal(next);
    if (!isEditing) setTempGoal(next);
  }, [goalProp, initialGoal, isEditing]);

  const handleSave = async () => {
    const trimmed = (tempGoal ?? "").trim();
    if (!sessionId) {
      // no sessionId => just local update
      setGoal(trimmed);
      setIsEditing(false);
      onSaved?.(trimmed);
      return;
    }
    if (saving) return;

    // optimistic update
    const prevGoal = goal;
    setGoal(trimmed);
    setSaving(true);

    try {
      await api.put(
        `/api/pt/session/todayGoal?sessionId=${encodeURIComponent(sessionId)}`,
        { todayGoal: trimmed }
      );
      // success
      setIsEditing(false);
      onSaved?.(trimmed);
    } catch (e) {
      // rollback on failure
      setGoal(prevGoal);
      alert(
        e?.message || "목표 저장에 실패했습니다. 네트워크 상태를 확인해 주세요."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempGoal(goal);
    setIsEditing(false);
  };

  return (
    <div className="goal-card">
      <div className="goal-name">Today's Goal</div>

      {isEditing ? (
        <div>
          <textarea
            className="goal-input"
            value={tempGoal}
            onChange={(e) => setTempGoal(e.target.value)}
            rows={3}
            cols={40}
            placeholder="Enter your PT goal here."
            disabled={saving}
          />
          <div>
            <button className="goal-button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="goal-button" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="goal-content">{goal || "No goal yet."}</p>
          <button
            className="goal-edit-button"
            onClick={() => setIsEditing(true)}
            disabled={saving}
          >
            edit goal
          </button>
        </div>
      )}
    </div>
  );
};

export default PTGoalCard;
