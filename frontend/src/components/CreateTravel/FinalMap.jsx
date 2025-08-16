// src/components/CreateTravel/FinalMap.jsx
import React, { useState, useEffect } from 'react';
import PlaceMap from '../StandardCreatePage/PlaceMap';
import LocationIcon from '../../icons/LocationIcon';
import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import SaveIcon from '../../icons/SaveIcon';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { format, eachDayOfInterval } from 'date-fns';

const predefinedCategories = ['place', 'dining', 'stay'];

const FinalMap = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [dateTabs, setDateTabs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDate, setActiveDate] = useState('All');
  const [selectedPlaceForMap, setSelectedPlaceForMap] = useState(null);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const dates = eachDayOfInterval({
        start: new Date(formData.startDate),
        end: new Date(formData.endDate),
      }).map(d => format(d, 'MM/dd')); // Changed the format here
      setDateTabs(dates);
    }
  }, [formData.startDate, formData.endDate]);

  const allScheduledPlaces = (formData.places || []).filter(p => p.date);

  const filteredPlaces = allScheduledPlaces.filter((place) => {
    const matchCategory = activeCategory === 'All' || place.category === activeCategory;
    const matchDate = activeDate === 'All' || place.date === activeDate;
    return matchCategory && matchDate;
  });

  const handlePlaceClick = (place) => {
    setSelectedPlaceForMap(place);
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      places: allScheduledPlaces,
    };

    try {
      const res = await fetch('/api/project/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('저장 완료!');
        nextStep();
      } else {
        alert('저장 실패!');
      }
    } catch (err) {
      console.error('저장 오류:', err);
      alert('에러 발생');
    }
  };

  return (
    <div className="choose-place-container">
      <div className="choose-title">
        <button onClick={prevStep} className="prev-button"><BackIcon /></button>
        <h2>{formData.title}</h2>
      </div>

      <div className="choose-content">
        <div className="map-section">
          <PlaceMap places={filteredPlaces} selectedPlace={selectedPlaceForMap} />
        </div>

        <div className="choose-search-panel">
          {/* Category Tabs */}
          <div className="tab category-tabs">
            {['All', ...predefinedCategories].map((tab) => (
              <button
                key={tab}
                className={`category-tab ${activeCategory === tab ? 'active' : ''}`}
                onClick={() => setActiveCategory(tab)}
                disabled={activeCategory === tab}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Date Tabs (dynamically generated) */}
          <div className="tab date-tabs">
            {['All', ...dateTabs].map((tab) => (
              <button
                key={tab}
                className={`date-tab ${activeDate === tab ? 'active' : ''}`}
                onClick={() => setActiveDate(tab)}
                disabled={activeDate === tab}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Place List */}
          <ul className="place-list">
            {filteredPlaces.length === 0 ? (
              <li>No places for this selection.</li>
            ) : (
              filteredPlaces.map((place) => (
                <li
                  key={place.id}
                  className="place-item selected"
                  onClick={() => handlePlaceClick(place)}
                >
                  <div className="place-title">
                    <LocationIcon color="#081F5C" />
                    <span>{place.name}</span>
                  </div>
                  <div className="place-address">{place.address}</div>
                  <div className="place-desc">
                    {place.description || 'No description...'}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="save-project-bottom-right">
        <button className="save-project-save-button" onClick={handleSave}>
          Save <SaveIcon />
        </button>
      </div>
    </div>
  );
};

export default FinalMap;