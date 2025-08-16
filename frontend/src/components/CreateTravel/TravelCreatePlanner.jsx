// src/components/CreateTravel/TravelCreatePlanner.jsx
import React, { useState } from 'react';
import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import PlaceMap from '../StandardCreatePage/PlaceMap';
import MemoCard from "../ProjectView/MemoCard";
import TravelPlannerCard from './TravelPlannerCard';
import "./TravelCreatePlanner.css";

// src/components/CreateTravel/TravelCreatePlanner.jsx
// ... (imports and state)

const TravelPlannerCreate = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [scheduledPlaces, setScheduledPlaces] = useState([]);
  const [selectedPlaces] = useState(formData.places || []);
  const [hoveredPlace, setHoveredPlace] = useState(null); // Keep this state here

  const handleNext = () => {
    updateFormData({ places: scheduledPlaces });
    nextStep();
  };

  return (
    <div className="planner-home-container">
      
      {/* ... */}
      <div className="planner-section-div">
        <div className="choose-title">
          <button onClick={prevStep} className="prev-button"><BackIcon /></button>
          <h2>{formData.title}</h2>
      </div>
              <TravelPlannerCard
        formData={formData}
        selectedPlaces={selectedPlaces} // This is already being passed
        setPlacesForDates={setScheduledPlaces}
        // Pass the state setter function down to the child component
        setHoveredPlace={setHoveredPlace} 
      />

      </div>

      {/* ... */}
      <div className="planner-section-div">
        <div className="map-section">
          <PlaceMap 
            selectedPlace={hoveredPlace} // This is what the map will display
            places={selectedPlaces}
          />
        </div>
        <MemoCard />
      </div>
      {/* ... */}
            <button className="project2-next-button" onClick={handleNext}><ProjectNextIcon /></button>
      
    </div>

  );
};

export default TravelPlannerCreate;