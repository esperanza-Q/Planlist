// src/components/PT/PTList.jsx
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

const pickFinalized = (row) => toBool(row?._finalized ?? row?.is_finalized ?? row?.finalized);

const PTList = ({ project = {} }) => {
  const navigate = useNavigate();

  const rawArr = Array.isArray(project?._sessionsRaw) ? project._sessionsRaw : null;
  const simpleArr = !rawArr && Array.isArray(project.sessions) ? project.sessions : [];

  const sessions = rawArr
    ? rawArr.map((s, i) => ({
        plannerId: s?.plannerId ?? s?.id ?? String(i + 1),
        title: s?.title ?? `Session ${i + 1}`,
        finalized: pickFinalized(s),
      }))
    : simpleArr.map((t, i) => ({
        plannerId: String(i + 1),
        title: t ?? `Session ${i + 1}`,
        finalized: false,
      }));

  const goAddSession = () => {
    if (!project.id) {
      alert("Missing project id.");
      return;
    }
    navigate(`/project?category=pt&step=3&projectId=${encodeURIComponent(project.id)}`);
  };

  const goSessionDetails = (plannerId, finalized) => {
    if (!plannerId) return;

    if (finalized) {
      // Finalized → details page
      navigate(`/project/pt/details?plannerId=${encodeURIComponent(plannerId)}`);
    } else {
      // Not finalized → calendar/step3 page (edit flow)
      if (!project.id) {
        alert("Missing project id.");
        return;
      }
      navigate(`/project?category=pt&step=3&projectId=${encodeURIComponent(project.id)}`);
    }
  };

  return (
    <div className="session-list-card">
      <div className="card-title">PT sessions</div>

      <button className="add-session" onClick={goAddSession}>
        add session
      </button>

      <div className="session-list">
        {sessions.length === 0 ? (
          <div className="empty">No sessions yet.</div>
        ) : (
          sessions.map((s) => (
            <button
              key={s.plannerId}
              className="session-link"
              onClick={() => goSessionDetails(s.plannerId, s.finalized)}
              title={s.finalized ? "Finalized" : "Draft"}
              data-finalized={String(s.finalized)}
              data-plannerid={String(s.plannerId)}
            >
              {s.title}
              
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default PTList;