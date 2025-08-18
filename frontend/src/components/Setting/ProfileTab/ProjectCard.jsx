// src/components/Setting/ProfileTab/ProjectCard.jsx
import React, { useEffect, useState } from "react";

import check_circle from "../../../assets/check_circle.svg";
import x_circle from "../../../assets/x_circle.svg";
import ProfilePic from "../../../assets/ProfilePic.png";
import { api } from "../../../api/client"; // <-- use same client as elsewhere

// helper: stable row key
const rowKey = (p, i) =>
  p?.invitee_id ?? p?.inviteeId ?? p?.id ?? p?.projectId ?? i;

// helper: resolve inviteeId in any shape; coerce numeric if looks like a number
const resolveInviteeId = (p) => {
  const raw =
    p?.invitee_id ??
    p?.inviteeId ??
    p?.id ??
    p?.projectInviteId ??
    p?.project?.inviteeId ??
    null;
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : raw;
};

const ProjectCard = ({ projectRequests }) => {
  const [requests, setRequests] = useState(projectRequests || []);
  const [pending, setPending] = useState(new Set()); // per-row loading lock

  // keep local state in sync when parent prop updates after fetch
  useEffect(() => {
    setRequests(projectRequests || []);
  }, [projectRequests]);

  const optimisticRemoveByIndex = (idx) => {
    const snapshot = requests;
    const next = snapshot.filter((_, i) => i !== idx);
    setRequests(next);
    return snapshot; // return for rollback
  };

  const withPending = (key, fn) => async (...args) => {
    setPending((prev) => new Set(prev).add(key));
    try {
      await fn(...args);
    } finally {
      setPending((prev) => {
        const n = new Set(prev);
        n.delete(key);
        return n;
      });
    }
  };

  const handleAccept = (index) => {
    const project = requests[index];
    const key = rowKey(project, index);
    const inviteeId = resolveInviteeId(project);

    if (inviteeId == null) {
      alert("초대 ID(inviteeId)를 찾을 수 없어 승인할 수 없어요.");
      return;
    }

    const run = async () => {
      const rollback = optimisticRemoveByIndex(index);
      try {
        await api.putSession("/api/settings/profile/acceptProject", {
          inviteeId,
        });
        // success: nothing else to do
      } catch (e) {
        console.error("[ACCEPT project] failed:", e);
        setRequests(rollback); // rollback UI
        alert("프로젝트 요청 승인에 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
    };

    withPending(key, run)();
  };

  const handleDecline = (index) => {
    const project = requests[index];
    const key = rowKey(project, index);
    const inviteeId = resolveInviteeId(project);

    if (inviteeId == null) {
      alert("초대 ID(inviteeId)를 찾을 수 없어 거절할 수 없어요.");
      return;
    }

    const run = async () => {
      const rollback = optimisticRemoveByIndex(index);
      try {
        // Spec shows same body; using POST to match accept pattern
        await api.putSession("/api/settings/profile/rejectProject", {
          inviteeId,
        });
      } catch (e) {
        console.error("[REJECT project] failed:", e);
        setRequests(rollback); // rollback UI
        alert("프로젝트 요청 거절에 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
    };

    withPending(key, run)();
  };

  return (
    <div className="project-card">
      <div className="project-card-title">Project request</div>
      <div className="project-item-container">
        {(requests || []).map((project, index) => {
          const key = rowKey(project, index);
          const isLoading = pending.has(key);

          return (
            <div className="project-item" key={key}>
              <img
                className="project-avatar"
                alt="Profile"
                src={project?.profile_image || ProfilePic}
                loading="lazy"
                onError={(e) => {
                  if (e.currentTarget.src !== ProfilePic) {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = ProfilePic;
                  }
                }}
              />

              <div className="project-name">
                {project?.projectTitle ?? "Project title"}
              </div>
              <div className="project-owner">
                {project?.creator ?? "creator"}
              </div>

              <button
                className={`project-action-button accept${
                  isLoading ? " is-loading" : ""
                }`}
                onClick={() => handleAccept(index)}
                title="Accept"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <span className="spinner" aria-hidden="true" />
                ) : (
                  <img alt="accept" src={check_circle} />
                )}
              </button>

              <button
                className="project-action-button decline"
                onClick={() => handleDecline(index)}
                title="Decline"
                disabled={isLoading}
              >
                <img alt="delete" src={x_circle} />
              </button>
            </div>
          );
        })}
        {/* {(!requests || requests.length === 0) && (
        )} */}
      </div>
    </div>
  );
};

export default ProjectCard;
