import { useNavigate } from "react-router-dom";

const PTList = ({ project = {} }) => {
  const navigate = useNavigate();

  const raw = Array.isArray(project._sessionsRaw) ? project._sessionsRaw : null;
  const simple = !raw && Array.isArray(project.sessions) ? project.sessions : [];

  const sessions = raw
    ? raw.map((s, i) => ({
        plannerId: s?.plannerId ?? s?.id ?? String(i + 1),
        title: s?.title ?? `Session ${i + 1}`,
        finalized: !!s?.is_finalized,
      }))
    : simple.map((t, i) => ({
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

  const goSessionDetails = (plannerId) => {
    if (!plannerId) return;
    navigate(`/project/pt/details?plannerId=${encodeURIComponent(plannerId)}`);
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
              onClick={() => goSessionDetails(s.plannerId)}
              title={s.finalized ? "Finalized" : "Draft"}
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
