// src/components/ProjectViewTravel/TravelMemoCard.jsx
import React, { useMemo, useState, useEffect } from "react";
import memo_trashbin from "../../assets/memo_trashbin.svg";
import arrow from "../../assets/arrow.svg";
import "../ProjectView/MemoCard.css";

/**
 * Props:
 * - memos?: controlled list [{ id, type: 'personal'|'group', project, title?, content, category, noteId? }, ...]
 * - initialMemos?: same shape (fallback when uncontrolled)
 * - onChange?: (nextMemos) => void
 * - onAddClick?: () => void   // open modal in parent
 */
const TravelMemoCard = ({ memos: controlled, initialMemos = [], onChange, onAddClick }) => {
  const isControlled = Array.isArray(controlled);
  const [activeTab, setActiveTab] = useState("personal");
  const [internal, setInternal] = useState(initialMemos);

  // Effective list
  const list = isControlled ? controlled : internal;

  useEffect(() => {
    if (!isControlled) setInternal(initialMemos);
  }, [initialMemos, isControlled]);

  const visibleMemos = useMemo(
    () => (list || []).filter((m) => m.type === activeTab),
    [list, activeTab]
  );

  function remove(id) {
    const next = (list || []).filter((m) => m.id !== id);
    if (isControlled) {
      onChange && onChange(next);
    } else {
      setInternal(next);
      onChange && onChange(next);
    }
  }

  return (
    <div className="memo-card travel-memo-card">
      <div className="card-title"> Memo </div>

      {/* Tabs */}
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

      {/* Memo List */}
      <ul className="memo-list scrollable memo-list-travel">
        {visibleMemos.length === 0 ? (
          <li className="empty">No {activeTab} memos yet.</li>
        ) : (
          visibleMemos.map((m) => (
            <div key={m.id} className="memo-item">
              <button className="memo-edit-button" disabled>
                <img src={arrow} alt="open" />
              </button>
              <button className="memo-delete-button" onClick={() => remove(m.id)}>
                <img src={memo_trashbin} alt="delete" />
              </button>

              <div className="memo-title">{m.title || m.project}</div>
              <p className="memo-content">{m.content}</p>
              {m.category && <span className="memo-tag">{m.category}</span>}
            </div>
          ))
        )}
      </ul>

      <button className="meet-button add" onClick={onAddClick}>
        <p>Add memo</p>
      </button>
    </div>
  );
};

export default TravelMemoCard;
