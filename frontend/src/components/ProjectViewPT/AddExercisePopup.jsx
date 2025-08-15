import "./Popup.css";
import React, { useState } from "react";
import search_icon from "../../assets/search_icon.svg"
import dumbbell_icon from "../../assets/dumbbell_icon.svg"

const AddExercisePopup = ({ exercises, onSave, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sets, setSets] = useState("");
  const [time, setTime] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (searchTerm && sets && time) {
      const exerciseToSave = selectedExercise || { id: Date.now(), name: searchTerm };
      onSave({
        ...exerciseToSave,
        sets: parseInt(sets, 10),
        time: parseInt(time, 10),
      });
      onClose();
    } else {
      alert("Please enter an exercise name and fill out sets and time.");
    }
  };

  const handleSelectExercise = (ex) => {
    setSelectedExercise(ex);
    setSearchTerm(ex.name);
    setDropdownOpen(false);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <div className="popup-icon">
                    <img src={dumbbell_icon}/>

        </div>
        <div className="popup-title">Add exercise</div>
        <div className="popup-description">some details about the exercise</div>
        <div className="spacer" style={{height:"10px"}}/>
        
        
        <div className="dropdown">
            <div className="dropdown-name">
                Name of exercise
            </div>

            <div className="spacer" style={{height:"15px"}}/>
            
            <div className="search-bar">
                <button className="search-list">
                    <img  src={search_icon}/>
                </button>
                    
                <input
                    className="popup-search"
                    type="text"
                    placeholder="Search exercise..."
                    value={searchTerm}
                    onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setDropdownOpen(true);
                    }}
                    onFocus={() => setDropdownOpen(true)}
                />

            </div>
            
            

            {dropdownOpen && (
            <ul className="dropdown-list">
            {filteredExercises.map((ex) => (
                <li
                key={ex.id}
                onClick={() => handleSelectExercise(ex)}
                className={selectedExercise?.id === ex.id ? "selected" : ""}
                >
                {ex.name}
                </li>
            ))}
            
            </ul>
        )}
        </div>
        
        <div className="spacer" style={{height:"5px"}}/>


        <div className="popup-row">
            <div>exercise time</div>
            <input
                className="popup-num-input"  
                type="number"
                placeholder="Time (min)"
                value={time}
                min="1"
                onChange={(e) => setTime(e.target.value)}
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
            />
        </div>
        

        <div className="spacer" style={{height:"5px"}}/>


        <div className="popup-actions">
        <button className="popup-save" onClick={handleSave}>Save</button>
        <button className="popup-cancel" onClick={onClose}>
            Cancel
        </button>
        </div>
    </div>
    </div>
  );
};

export default AddExercisePopup;
