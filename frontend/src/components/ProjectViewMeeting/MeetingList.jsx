// src/components/ProjectViewMeeting/MeetingList.jsx
import { useNavigate } from "react-router-dom";

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

const pickFinalized = (row) =>
  toBool(row?._finalized ?? row?.is_finalized ?? row?.finalized);

const MeetingList = ({ project = {} }) => {
  const navigate = useNavigate();

  // Your normalizeProject already returns objects like:
  // { plannerId, title, finalized }
  const raw = Array.isArray(project?.meetings) ? project.meetings : [];

  const sessions = raw.map((mtg, i) => {
    if (typeof mtg === "string") {
      return { plannerId: null, title: mtg, finalized: false };
    }
    return {
      plannerId: mtg?.plannerId ?? mtg?.id ?? String(i + 1),
      title: mtg?.title ?? `meeting ${i + 1}`,
      finalized: pickFinalized(mtg),
    };
  });

  const goAddMeeting = () => {
    if (!project.id) {
      alert("Missing project id.");
      return;
    }
    navigate(
      `/project/create/meeting?step=3&projectId=${encodeURIComponent(
        project.id
      )}`
    );
  };

  const goSession = (plannerId, finalized) => {
    if (!plannerId) return;

    if (finalized) {
      // finalized → details
      navigate(
        `/project/meeting/details?plannerId=${encodeURIComponent(
          plannerId
        )}&projectId=${encodeURIComponent(project.id ?? "")}`
      );
    } else {
      // draft → step 4 (date/time select)
      if (!project.id) {
        alert("Missing project id.");
        return;
      }
      navigate(
        `/project/create/meeting?step=4&projectId=${encodeURIComponent(
          project.id
        )}&plannerId=${encodeURIComponent(plannerId)}`
      );
    }
  };

  return (
    <div className="meeting-list-card">
      <div className="card-title">Meetings</div>

      <button className="add-meeting" onClick={goAddMeeting}>
        add meeting
      </button>

      <div className="meeting-list">
        {sessions.length === 0 ? (
          <div className="empty">No meetings yet.</div>
        ) : (
          sessions.map((s) => (
            <button
              key={s.plannerId ?? s.title}
              className="meeting-link"
              onClick={() => goSession(s.plannerId, s.finalized)}
              title={s.finalized ? "Finalized" : "Draft"}
              data-finalized={String(s.finalized)}
              data-plannerid={String(s.plannerId ?? "")}
            >
              {s.title}
 
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default MeetingList;
