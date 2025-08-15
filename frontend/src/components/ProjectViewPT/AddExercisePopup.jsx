// src/components/PT/AddExercisePopup.jsx
import "./Popup.css";
import React, { useState, useMemo, useRef } from "react";
import search_icon from "../../assets/search_icon.svg";
import dumbbell_icon from "../../assets/dumbbell_icon.svg";

/** accept [{ id,name }] or [{ exerciseId, exerciseName }] */
const normalizeList = (list = []) =>
  list.map((ex, i) => ({
    id: ex?.id ?? ex?.exerciseId ?? i + 1,
    name: ex?.name ?? ex?.exerciseName ?? `Exercise ${i + 1}`,
  }));

const AddExercisePopup = ({ exercises = [], onSave, onClose, saving = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sets, setSets] = useState("");
  const [time, setTime] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const inputRef = useRef(null);
  const blurTimerRef = useRef(null);

  const normalized = useMemo(() => normalizeList(exercises), [exercises]);

  const filteredExercises = useMemo(() => {
    const q = (searchTerm || "").toLowerCase().trim();
    if (!q) return normalized;
    return normalized.filter((ex) => ex.name.toLowerCase().includes(q));
  }, [normalized, searchTerm]);

  const handleSave = () => {
    const s = Number(sets);
    const t = Number(time);

    if (!selectedExercise?.id) {
      alert("리스트에서 운동을 선택해 주세요."); // need exerciseId for API
      return;
    }
    if (!Number.isFinite(s) || s <= 0 || !Number.isFinite(t) || t <= 0) {
      alert("Sets와 Time을 올바르게 입력해 주세요.");
      return;
    }

    onSave?.({
      exerciseId: selectedExercise.id, // API expects exerciseId
      name: selectedExercise.name,
      sets: s,
      time: t,
    });
  };

  const handleSelectExercise = (ex) => {
    setSelectedExercise(ex);
    setSearchTerm(ex.name);
    setDropdownOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <div className="popup-icon">
          <img src={dumbbell_icon} alt="exercise" />
        </div>
        <div className="popup-title">Add exercise</div>
        <div className="popup-description">Select an exercise and set details.</div>
        <div className="spacer" style={{ height: "10px" }} />

        <div className="dropdown" style={{ position: "relative" }}>
          <div className="dropdown-name">Name of exercise</div>
          <div className="spacer" style={{ height: "15px" }} />

          <div className="search-bar">
            <button className="search-list" type="button" aria-label="search">
              <img src={search_icon} alt="search" />
            </button>

            <input
              ref={inputRef}
              className="popup-search"
              type="text"
              placeholder="Search exercise..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setDropdownOpen(true);
                if (!e.target.value) setSelectedExercise(null);
              }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => {
                blurTimerRef.current = setTimeout(() => setDropdownOpen(false), 120);
              }}
              disabled={saving}
              autoComplete="off"
            />
          </div>

          {dropdownOpen && (
            <ul
              className="dropdown-list"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 9999,
                maxHeight: 240,
                overflowY: "auto",
                background: "white",
                border: "1px solid #ddd",
                borderRadius: 8,
                marginTop: 6,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              }}
              onMouseDown={(e) => {
                e.preventDefault(); // keep input from blurring before click
                if (blurTimerRef.current) {
                  clearTimeout(blurTimerRef.current);
                  blurTimerRef.current = null;
                }
              }}
            >
              {filteredExercises.length > 0 ? (
                filteredExercises.map((ex) => (
                  <li
                    key={ex.id}
                    onClick={() => handleSelectExercise(ex)}
                    className={selectedExercise?.id === ex.id ? "selected" : ""}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      userSelect: "none",
                      background:
                        selectedExercise?.id === ex.id ? "#f3f4f6" : "white",
                    }}
                  >
                    {ex.name}
                  </li>
                ))
              ) : (
                <li className="disabled" style={{ padding: "10px 12px", color: "#888" }}>
                  No matches
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="spacer" style={{ height: "5px" }} />

        <div className="popup-row">
          <div>exercise time</div>
          <input
            className="popup-num-input"
            type="number"
            placeholder="Time (min)"
            value={time}
            min="1"
            onChange={(e) => setTime(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="popup-row">
          <div>exercise sets</div>
          <input
            className="popup-num-input"
            type="number"
            placeholder="Sets"
            value={sets}
            min="1"
            onChange={(e) => setSets(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="spacer" style={{ height: "5px" }} />

        <div className="popup-actions">
          <button className="popup-save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="popup-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExercisePopup;
