import React, { useState } from 'react';
import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import PlaceMap from '../StandardCreatePage/PlaceMap';
import MemoCard from '../ProjectViewTravel/TravelMemoCard';
import TravelPlannerCard from './TravelPlannerCard';
import "./TravelCreatePlanner.css";

const TravelPlannerCreate = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [scheduledPlaces, setScheduledPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState(formData.places || []);
  

  const handleNext = () => {
    updateFormData({ places: scheduledPlaces });
    nextStep();
  };

  return (
    <div className="planner-home-container">
      <div className='planner-home-container-div'>
        <div className="choose-title">
          <button onClick={prevStep} className="prev-button"><BackIcon /></button>
          <h2>Project name</h2>
        </div>

        <TravelPlannerCard
          formData={formData}
          setPlacesForDates={setScheduledPlaces}
        />


      </div>

      <div className="planner-section-div">
        <div className="map-section">
          <PlaceMap  selectedPlace={selectedPlaces[0] || null} />
    
        </div>
        <MemoCard />
      
      </div>

      <button className="project2-next-button" onClick={handleNext}>
        <ProjectNextIcon />
      </button>
    </div>
  );
};

export default TravelPlannerCreate;
