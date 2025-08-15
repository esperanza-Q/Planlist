import React, { useState } from "react";

const PTGoalCard = ({ initialGoal = "Enter your PT goal here." }) => {
  const [goal, setGoal] = useState(initialGoal);
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal);

  const handleSave = () => {
    setGoal(tempGoal);
    setIsEditing(false);
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
          <input className="goal-input"
            value={tempGoal}
            onChange={(e) => setTempGoal(e.target.value)}
            rows={3}
            cols={40}
          />
          <div>
            <button className="goal-button" onClick={handleSave}>Save</button>
            <button className="goal-button" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <p className="goal-content">{goal}</p>
          <button className="goal-edit-button" onClick={() => setIsEditing(true)}>edit goal</button>
        </div>
      )}
    </div>
  );
};

export default PTGoalCard;
