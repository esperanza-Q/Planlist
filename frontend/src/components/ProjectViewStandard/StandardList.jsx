// src/components/ProjectViewStandard/StandardList.jsx
import { useNavigate } from "react-router-dom";

const toBool = (v) => (v === true || v === "true" || v === 1 || v === "1");
const pickFinalized = (row) => toBool(row?._finalized ?? row?.is_finalized ?? row?.finalized);

const StandardList = ({ project = {} }) => {
  const navigate = useNavigate();
  const raw = Array.isArray(project?.meetings) ? project.meetings : [];

  const sessions = raw.map((s, i) => ({
    plannerId: s?.plannerId ?? s?.id ?? String(i + 1),
    title: s?.title ?? `session ${i + 1}`,
    finalized: pickFinalized(s),
  }));

  const goAddSession = () => {
    if (!project.id) return alert("Missing project id.");
    navigate(`/project/create/standard?step=3&projectId=${encodeURIComponent(project.id)}`);
  };

  const goSession = (plannerId, finalized) => {
    if (!plannerId) return;
    if (finalized) {
      // ✅ finalized → Standard details
      navigate(
        `/project/standard/details?plannerId=${encodeURIComponent(plannerId)}&projectId=${encodeURIComponent(project.id ?? "")}`
      );
    } else {
      // draft → step 4
      if (!project.id) return alert("Missing project id.");
      navigate(
        `/project/create/standard?step=4&projectId=${encodeURIComponent(project.id)}&plannerId=${encodeURIComponent(plannerId)}`
      );
    }
  };

  return (
    <div className="meeting-list-card">
      <div className="card-title">Sessions</div>
      <button className="add-meeting" onClick={goAddSession}>add session</button>
      <div className="meeting-list">
        {sessions.length === 0 ? (
          <div className="empty">No sessions yet.</div>
        ) : (
          sessions.map((s) => (
            <button
              key={s.plannerId}
              className="meeting-link"
              onClick={() => goSession(s.plannerId, s.finalized)}
              title={s.finalized ? "Finalized" : "Draft"}
            >
              {s.title}{s.finalized ? " ✅" : ""}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default StandardList;
