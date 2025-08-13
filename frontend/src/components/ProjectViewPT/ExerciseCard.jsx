import React, { useState } from "react";
import AddExercisePopup from "./AddExercisePopup";
import x_circle from "../../assets/x_circle.svg"

const WorkoutPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [activeTab, setActiveTab] = useState("done");

  const exerciseList = [
    { id: 1, name: "Push Ups" },
    { id: 2, name: "Squats" },
    { id: 3, name: "Plank" },
    { id: 4, name: "Jumping Jacks" }
  ];

  const trainersPick = [
    { id: "1", name: "Burpees", sets: 3, time: 2 },
    { id: "2", name: "Lunges", sets: 2, time: 1.5 }
  ];

  const handleSave = (exercise) => {
    setSelectedExercises((prev) => [...prev, exercise]);
  };

  const handleDelete = (index) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {showPopup && (
        <AddExercisePopup
          exercises={exerciseList}
          onSave={handleSave}
          onClose={() => setShowPopup(false)}
        />
      )}


      {/* Tabs */}
      <div className="tab exercise-card-tab" style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("trainer")}
          disabled={activeTab === "trainer"}
        >
          Trainer's Pick
        </button>
        <button
          onClick={() => setActiveTab("done")}
          disabled={activeTab === "done"}
        >
          Done
        </button>
        
      </div>

      {/* Content */}
      {activeTab === "done" ? (
        <ul className="exercise-list">
          {selectedExercises.length === 0 ? (
            <li>No exercises done yet</li>
          ) : (
            selectedExercises.map((ex, index) => (
              <li className="exercise-item" key={index}>
                <span className="exercise-title">{ex.name}  </span>
                <span>
                  <div>
                    {ex.sets} sets {ex.time} min{" "}
                  </div>
                </span>
                
                <button
                  onClick={() => handleDelete(index)}
                  style={{ marginLeft: "10px", color: "red" }}
                >
                  <img src={x_circle}/>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : (
        <ul className="exercise-list">
          {trainersPick.map((ex, index) => (
              <li className="exercise-item" key={index}>
                <span className="exercise-title">{ex.name}  </span>
                <span>
                  <div>
                    {ex.sets} sets {ex.time} min{" "}
                  </div>
                </span>
                
                <button
                  onClick={() => handleDelete(index)}
                  style={{ marginLeft: "10px", color: "red" }}
                >
                  <img src={x_circle}/>
                </button>
              </li>
            ))}
        </ul>
      )}

      
        <button className="add-sets" onClick={() => setShowPopup(true)}> Add Sets</button>
    </div>
  );
};

export default WorkoutPage;
