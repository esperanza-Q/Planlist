// src/components/ProjectView/MemoCard.jsx
import React, { useState, useMemo } from "react";
import memo_trashbin from "../../assets/memo_trashbin.svg";
import arrow from "../../assets/arrow.svg";
import "../ProjectView/MemoCard.css";

// If your file is named differently, adjust this import:
import MemoModal from "../../components/StandardCreatePage/MemoModal";

const MemoCard = ({ initialMemos = [], onChange, projectId }) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [memos, setMemos] = useState(initialMemos);
  const [showMemoModal, setShowMemoModal] = useState(false);

  const visibleMemos = useMemo(
    () => memos.filter((m) => m.type === activeTab),
    [memos, activeTab]
  );

  function remove(id) {
    const next = memos.filter((m) => m.id !== id);
    setMemos(next);
    if (typeof onChange === "function") onChange(next);
  }

  function handleSaveFromModal(newMemo) {
    // MemoModal returns: { id, type, title, description, category }
    const mapped = {
      id: String(newMemo.id),
      type: newMemo.type === "group" ? "group" : "personal",
      project: newMemo.title || "Untitled",
      content: newMemo.description || "",
      category: newMemo.category || "pt",
    };

    const next = [mapped, ...memos];
    setMemos(next);
    if (typeof onChange === "function") onChange(next);
    // Optional: switch tab to the saved memo type so user sees it immediately
    setActiveTab(mapped.type);
  }

  return (
    <div className="memo-card">
      <div className="card-title">Memo</div>

      <div className="tab memo">
        {["personal", "group"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={activeTab === tab}
          >
            {tab === "personal" ? "Personal" : "Group"}
          </button>
        ))}
      </div>

      <ul className="memo-list scrollable">
        {visibleMemos.length === 0 ? (
          <li className="empty">No {activeTab} memos yet.</li>
        ) : (
          visibleMemos.map((m) => (
            <div key={m.id} className="memo-item">
              <button className="memo-edit-button" disabled>
                <img src={arrow} alt="" />
              </button>
              <button className="memo-delete-button" onClick={() => remove(m.id)}>
                <img src={memo_trashbin} alt="delete" />
              </button>

              <div className="memo-title">{m.project}</div>
              <p className="memo-content">{m.content}</p>
              {m.category && <span className="memo-tag">{m.category}</span>}
            </div>
          ))
        )}
      </ul>

      <button
        className="meet-button add"
        onClick={() => setShowMemoModal(true)}
        title={projectId ? "Add memo" : "Project ID missing"}
      >
        <p>Add memo</p>
      </button>

      {showMemoModal && (
        <MemoModal
          projectId={projectId}          /* <-- passed here */
          onClose={() => setShowMemoModal(false)}
          onSave={(data) => {
            handleSaveFromModal(data);
            setShowMemoModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MemoCard;
